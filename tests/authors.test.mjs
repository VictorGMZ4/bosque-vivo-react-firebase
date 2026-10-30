import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {db,authAdmin} from '../functions/firebase.js';

test('history, trash and proposals show who made each change',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const stamp=Date.now(),users=[],apps=[],submissions=[],species=[];
 async function account(role,name){const email=`qa-authors-${role}-${users.length}-${stamp}@example.test`,password='Local-test-123!';const u=await authAdmin.createUser({email,password});users.push(u.uid);await db.collection('roles').doc(u.uid).set({role});if(name)await db.collection('profiles').doc(u.uid).set({name});const app=initializeApp({projectId:'demo-bosque-vivo',apiKey:'demo-key'},u.uid);apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);const f=getFunctions(app,'us-central1');connectFunctionsEmulator(f,'127.0.0.1',5001);return {uid:u.uid,email,work:async v=>(await httpsCallable(f,'workspace')(v)).data,mutate:async v=>(await httpsCallable(f,'mutate')(v)).data};}
 try{
  const admin=await account('admin','Admin QA'),teacher=await account('teacher'),student=await account('student');
  const {id}=await admin.mutate({entity:'species',action:'create',data:{common_name:'QA Autores',scientific_name:'QA autores '+stamp,family:'QA',habit:'herb',is_published:false}});species.push(id);
  const history=await admin.work({action:'historyList',id});
  assert.deepEqual(history.items.map(e=>[e.action,e.actor]),[['create',{name:'Admin QA',email:admin.email}]]);
  await admin.mutate({entity:'species',action:'delete',id});
  assert.deepEqual((await admin.work({action:'trashList'})).items.find(t=>t.id===id).actor,{name:'Admin QA',email:admin.email});

  const draft=await teacher.work({action:'draftSubmission',data:{common_name:'QA Propuesta',scientific_name:'QA propuesta '+stamp,family:'QA',habit:'herb'}});submissions.push(draft.id);
  assert.deepEqual((await admin.work({action:'submissionAuthors',ids:[draft.id,'qa-missing-'+stamp]})).authors,{[teacher.uid]:{name:'',email:teacher.email}});
  await assert.rejects(student.work({action:'submissionAuthors',ids:[draft.id]}));
  await assert.rejects(admin.work({action:'submissionAuthors',ids:'nope'}));

  await authAdmin.deleteUser(teacher.uid);users.splice(users.indexOf(teacher.uid),1);
  assert.deepEqual((await admin.work({action:'submissionAuthors',ids:[draft.id]})).authors,{[teacher.uid]:{name:'',email:''}});
 }finally{
  for(const app of apps)await deleteApp(app);
  for(const id of submissions)await db.collection('submissions').doc(id).delete();
  for(const id of species){await db.collection('trash').doc(id).delete();for(const d of (await db.collection('audit').where('entity_id','==',id).get()).docs)await d.ref.delete();}
  for(const uid of users){await db.collection('roles').doc(uid).delete();await db.collection('profiles').doc(uid).delete();await authAdmin.deleteUser(uid);}
 }
});
