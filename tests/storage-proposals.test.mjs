import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getStorage,connectStorageEmulator,ref,uploadBytes,getBytes} from 'firebase/storage';
import {db,authAdmin,bucket} from '../functions/firebase.js';

test('proposal photos are private, immutable and writable only by the draft author',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const id='qa-photo-permissions-'+Date.now(),users=[],apps=[];
 async function account(role){
  const email=`${id}-${role}@example.test`,password='QA-local-storage-123!';
  const user=await authAdmin.createUser({email,password});users.push(user.uid);
  await db.collection('roles').doc(user.uid).set({role});
  const app=initializeApp({projectId:'demo-bosque-vivo',apiKey:'demo-key',storageBucket:'demo-bosque-vivo.firebasestorage.app'},user.uid);apps.push(app);
  const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);
  const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199);return {uid:user.uid,storage};
 }
 try{
  const teacher=await account('teacher'),student=await account('student');
  const proposal=db.collection('submissions').doc(id);await proposal.set({owner_id:teacher.uid,status:'draft'});
  const path=`submissions/${id}/photos/photo.png`,bytes=new Uint8Array([1,2,3]),metadata={contentType:'image/png'};
  await uploadBytes(ref(teacher.storage,path),bytes,metadata);
  assert.equal((await getBytes(ref(teacher.storage,path))).byteLength,3);
  await assert.rejects(getBytes(ref(student.storage,path)),/unauthorized/i);
  await assert.rejects(uploadBytes(ref(teacher.storage,path),bytes,metadata),/unauthorized/i);
  await assert.rejects(uploadBytes(ref(student.storage,`submissions/${id}/photos/foreign.png`),bytes,metadata),/unauthorized/i);
  await proposal.update({status:'pending'});
  await assert.rejects(uploadBytes(ref(teacher.storage,`submissions/${id}/photos/late.png`),bytes,metadata),/unauthorized/i);
  await proposal.update({status:'draft',owner_id:student.uid});
  await assert.rejects(uploadBytes(ref(teacher.storage,`submissions/${id}/photos/foreign.png`),bytes,metadata),/unauthorized/i);
 }finally{
  for(const app of apps)await deleteApp(app);
  await db.collection('submissions').doc(id).delete();await bucket.deleteFiles({prefix:`submissions/${id}/`});
  for(const uid of users){await db.collection('roles').doc(uid).delete();await authAdmin.deleteUser(uid);}
 }
});
