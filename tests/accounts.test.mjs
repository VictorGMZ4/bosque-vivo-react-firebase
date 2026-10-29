import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {getFirestore,connectFirestoreEmulator,doc,getDoc} from 'firebase/firestore';
import {getStorage,connectStorageEmulator,ref,uploadBytes} from 'firebase/storage';
import {db,authAdmin,bucket} from '../functions/firebase.js';

test('blocked accounts lose every privileged path while their token is still valid, and can be restored',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const stamp=Date.now(),users=[],apps=[],submissions=[],files=[];
 const data={common_name:'QA Bloqueo',scientific_name:'QA bloqueo '+stamp,family:'QA',habit:'herb',is_published:false};
 const image={contentType:'image/png'},bytes=new Uint8Array([1,2,3]);
 async function account(role,legacy=false){const email=`qa-block-${role}-${users.length}-${stamp}@example.test`,password='Local-test-123!';const u=await authAdmin.createUser({email,password});users.push(u.uid);if(legacy)await authAdmin.setCustomUserClaims(u.uid,{admin:true});await db.collection('roles').doc(u.uid).set({role});const app=initializeApp({projectId:'demo-bosque-vivo',apiKey:'demo-key',storageBucket:'demo-bosque-vivo.firebasestorage.app'},u.uid);apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);const f=getFunctions(app,'us-central1');connectFunctionsEmulator(f,'127.0.0.1',5001);const store=getFirestore(app);connectFirestoreEmulator(store,'127.0.0.1',8080);const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199);return {uid:u.uid,email,store,storage,work:async v=>(await httpsCallable(f,'workspace')(v)).data};}
 async function listed(admin,uid){let cursor;do{const page=await admin.work({action:'listUsers',...(cursor?{cursor}:{})});const found=page.users.find(u=>u.uid===uid);if(found)return found;cursor=page.cursor;}while(cursor);return null;}
 try{
  const student=await account('student'),teacher=await account('teacher'),admin=await account('admin',true),other=await account('admin');
  const draft=await teacher.work({action:'draftSubmission',data});submissions.push(draft.id);
  const before=`submissions/${draft.id}/photos/before.png`;files.push(before);await uploadBytes(ref(teacher.storage,before),bytes,image);
  await student.work({action:'saveProfile',data:{name:'Estudiante QA'}});
  await assert.rejects(student.work({action:'setAccountStatus',uid:teacher.uid,disabled:true,reason:'Prueba'}));
  await assert.rejects(teacher.work({action:'setAccountStatus',uid:student.uid,disabled:true,reason:'Prueba'}));
  await assert.rejects(admin.work({action:'setAccountStatus',uid:admin.uid,disabled:true,reason:'Prueba'}),/propia cuenta/);
  await assert.rejects(admin.work({action:'setAccountStatus',uid:teacher.uid,disabled:true}));
  await assert.rejects(admin.work({action:'setAccountStatus',uid:teacher.uid,disabled:'yes',reason:'Prueba'}));

  await admin.work({action:'setAccountStatus',uid:teacher.uid,disabled:true,reason:'Uso indebido de propuestas'});
  const blocked=(await db.collection('roles').doc(teacher.uid).get()).data();
  assert.equal(blocked.role,'teacher');assert.equal(blocked.disabled,true);assert.equal(blocked.disabled_reason,'Uso indebido de propuestas');assert.equal(blocked.disabled_by,admin.uid);
  assert.equal((await authAdmin.getUser(teacher.uid)).disabled,true);
  assert.equal((await listed(admin,teacher.uid)).disabled,true);
  for(const action of [{action:'saveProfile',data:{name:'Profesor QA'}},{action:'collectionList'},{action:'notificationsList'},{action:'draftSubmission',id:draft.id,data}])await assert.rejects(teacher.work(action),/bloqueada/);
  await assert.rejects(uploadBytes(ref(teacher.storage,`submissions/${draft.id}/photos/after.png`),bytes,image),/unauthorized/i);

  await admin.work({action:'setRole',uid:teacher.uid,role:'student'});
  assert.equal((await db.collection('roles').doc(teacher.uid).get()).data().disabled,true);

  await admin.work({action:'setAccountStatus',uid:other.uid,disabled:true,reason:'Cuenta comprometida'});
  await assert.rejects(other.work({action:'listUsers'}),/bloqueada/);
  await assert.rejects(getDoc(doc(other.store,'profiles',student.uid)));
  assert.equal((await getDoc(doc(admin.store,'profiles',student.uid))).data().name,'Estudiante QA');

  const audit=await db.collection('audit').where('entity_id','==',teacher.uid).get();
  assert.deepEqual(audit.docs.map(d=>[d.data().entity,d.data().action,d.data().after.reason]),[['account','disable','Uso indebido de propuestas']]);

  await admin.work({action:'setAccountStatus',uid:teacher.uid,disabled:false});
  const restored=(await db.collection('roles').doc(teacher.uid).get()).data();
  assert.equal(restored.disabled,false);assert.equal(restored.role,'student');assert.equal(restored.disabled_reason,'');
  assert.equal((await authAdmin.getUser(teacher.uid)).disabled,false);
  await teacher.work({action:'saveProfile',data:{name:'Profesor QA'}});
  assert.ok((await teacher.work({action:'notificationsList'})).items.some(n=>n.title.includes('desbloqueada')));
 }finally{
  for(const app of apps)await deleteApp(app);
  for(const path of files)await bucket.file(path).delete({ignoreNotFound:true});
  for(const id of submissions)await db.collection('submissions').doc(id).delete();
  for(const uid of users){
   for(const name of ['audit','notifications'])for(const d of (await db.collection(name).where(name==='audit'?'entity_id':'owner_id','==',uid).get()).docs)await d.ref.delete();
   await db.collection('roles').doc(uid).delete();await db.collection('profiles').doc(uid).delete();await db.collection('personal_collections').doc(uid).delete();await authAdmin.deleteUser(uid);
  }
 }
});
