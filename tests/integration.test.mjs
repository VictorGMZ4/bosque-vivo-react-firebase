import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {getStorage,connectStorageEmulator,ref,uploadBytes,getBytes} from 'firebase/storage';
import {doc,getDoc,getDocs,collection,query,where,setDoc} from 'firebase/firestore';
import {db,authAdmin,bucket} from '../functions/firebase.js';
import {importSpecimen} from '../functions/import-utils.js';
let env,app,call,adminUid;
const projectId='demo-bosque-vivo';
before(async()=>{
 if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080'||process.env.FIREBASE_AUTH_EMULATOR_HOST!=='127.0.0.1:9099')throw Error('Pruebas únicamente en emuladores locales.');
 env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firebase/firestore.rules','utf8')}});
 const email=`qa-${Date.now()}@example.test`,password='QA-local-'+Date.now()+'!';
 const user=await authAdmin.createUser({email,password});adminUid=user.uid;await authAdmin.setCustomUserClaims(adminUid,{admin:true});
 app=initializeApp({projectId,apiKey:'demo-key',authDomain:'localhost'},'qa');const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);
 const f=getFunctions(app,'us-central1');connectFunctionsEmulator(f,'127.0.0.1',5001);call=async data=>(await httpsCallable(f,'mutate')(data)).data;
});
after(async()=>{if(adminUid)await authAdmin.deleteUser(adminUid);if(app)await deleteApp(app);if(env)await env.cleanup();});
test('real CRUD enforces uniqueness, published visibility and protected relationships',async()=>{
 const data={common_name:'QA Ceiba',scientific_name:'QA Ceiba '+Date.now(),family:'QA',habit:'tree',is_published:true};
 const {id}=await call({entity:'species',action:'create',data});
 const visitor=env.unauthenticatedContext().firestore();
 await assertSucceeds(getDoc(doc(visitor,'species',id)));
 await assert.rejects(call({entity:'species',action:'create',data}),/registrad|existe|duplicad/i);
 await assertFails(setDoc(doc(visitor,'species',id),{...data,is_published:true}));
 const unprivileged=env.authenticatedContext('ordinary').firestore();await assertFails(setDoc(doc(unprivileged,'species','forged'),data));
 await assertFails(setDoc(doc(env.authenticatedContext('admin',{admin:true}).firestore(),'species',id),data));
 const {id:specimen}=await call({entity:'specimen',action:'create',species_id:id,data:{code:'QA-'+Date.now(),zone:'Zona QA',height:2}});
 await assert.rejects(call({entity:'species',action:'delete',id}),/ejemplares/i);
 await call({entity:'specimen',action:'update',id:specimen,data:{code:'QA-'+specimen,zone:'Zona actualizada',height:3}});
 assert.equal((await db.collection('specimens').doc(specimen).get()).data().height,3);
 await call({entity:'species',action:'update',id,data:{...data,is_published:false}});
 await assertFails(getDoc(doc(visitor,'species',id)));await assertFails(getDoc(doc(visitor,'specimens',specimen)));
 await assertSucceeds(getDocs(query(collection(visitor,'species'),where('is_published','==',true))));
 await call({entity:'specimen',action:'delete',id:specimen});await call({entity:'species',action:'delete',id});
 assert.equal((await db.collection('species').doc(id).get()).exists,false);
});
test('callable rejects anonymous writes',async()=>{
 const anonymous=initializeApp({projectId,apiKey:'demo-key'},'anon');const f=getFunctions(anonymous);connectFunctionsEmulator(f,'127.0.0.1',5001);
 try{await assert.rejects(httpsCallable(f,'mutate')({entity:'species',action:'create',data:{}}),/sesión|unauthenticated/i);}finally{await deleteApp(anonymous);}
});
test('reimport cannot replace a specimen code reserved by another record',async()=>{
 const suffix=String(Date.now()),code='QA IMPORT '+suffix;
 const {keyFor}=await import('../functions/domain.js');
 const index=db.collection('specimen_codes').doc(keyFor(code));
 await index.set({id:'existing-'+suffix});
 try{await assert.rejects(importSpecimen(db,{id:'import-'+suffix,species_id:'8',code,zone:'QA'}),/registrado/i);assert.equal((await index.get()).data().id,'existing-'+suffix);assert.equal((await db.collection('specimens').doc('import-'+suffix).get()).exists,false);}finally{await index.delete();}
});
test('Storage protects drafts and rejects uploads by visitors or unsupported types',async()=>{
 const storage=getStorage(app,'gs://demo-bosque-vivo.firebasestorage.app');connectStorageEmulator(storage,'127.0.0.1',9199);
 const {id}=await call({entity:'species',action:'create',data:{common_name:'QA Storage',scientific_name:'QA Storage '+Date.now(),family:'QA',habit:'tree',is_published:false}});
 const photo=ref(storage,`species/${id}/photos/qa.png`);
 const visitor=initializeApp({projectId,apiKey:'demo-key',storageBucket:'demo-bosque-vivo.firebasestorage.app'},'storage-visitor');const vs=getStorage(visitor);connectStorageEmulator(vs,'127.0.0.1',9199);
 try{
  await uploadBytes(photo,new Uint8Array([1,2,3]),{contentType:'image/png'});
  await assert.rejects(getBytes(ref(vs,photo.fullPath)),/permission|unauthorized/i);
  await assert.rejects(uploadBytes(ref(vs,photo.fullPath),new Uint8Array([1]),{contentType:'image/png'}),/permission|unauthorized/i);
  await assert.rejects(uploadBytes(ref(storage,`species/${id}/photos/invalid.txt`),new Uint8Array([1]),{contentType:'text/plain'}),/permission|unauthorized/i);
  await call({entity:'species',action:'update',id,data:{common_name:'QA Storage',scientific_name:'QA Storage '+id,family:'QA',habit:'tree',is_published:true}});
  assert.equal((await getBytes(ref(vs,photo.fullPath))).byteLength,3);
 }finally{await call({entity:'species',action:'delete',id});await deleteApp(visitor);}
});

test('3D model is readable only while its species is public; browser uploads are denied',async()=>{
 const id='qa-model-'+Date.now(),species=db.collection('species').doc(id),file=bucket.file(`species/${id}/models/model.glb`);
 const visitor=initializeApp({projectId,apiKey:'demo-key',storageBucket:'demo-bosque-vivo.firebasestorage.app'},id);const storage=getStorage(visitor);connectStorageEmulator(storage,'127.0.0.1',9199);
 try{
  await species.set({is_published:false});await file.save(Buffer.from('glTF'),{metadata:{contentType:'model/gltf-binary'}});
  await assert.rejects(getBytes(ref(storage,file.name)),/permission|unauthorized/i);
  await species.update({is_published:true});assert.equal((await getBytes(ref(storage,file.name))).byteLength,4);
  await assert.rejects(uploadBytes(ref(storage,file.name),new Uint8Array([1]),{contentType:'model/gltf-binary'}),/permission|unauthorized/i);
  await species.delete();await assert.rejects(getBytes(ref(storage,file.name)),/permission|unauthorized/i);
 }finally{await species.delete();await file.delete();await deleteApp(visitor);}
});
