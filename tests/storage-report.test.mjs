import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {db,authAdmin,bucket} from '../functions/firebase.js';
import {orphanReport} from '../functions/storage-report.js';

test('orphan report lists only old unreferenced files and is admin-only',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const stamp=Date.now(),users=[],apps=[],species=`qa-orphan-${stamp}`,trashed=`qa-orphan-trash-${stamp}`;
 const paths={used:`species/${species}/photos/used.png`,model:`species/${species}/models/used.glb`,loose:`species/${species}/photos/loose.png`,gone:`species/qa-gone-${stamp}/photos/x.png`,proposal:`submissions/qa-gone-${stamp}/models/m.glb`,trash:`species/${trashed}/photos/t.png`,other:`qa-misc/${stamp}.txt`};
 async function account(role,disabled=false){const email=`qa-orphan-${role}-${users.length}-${stamp}@example.test`,password='Local-test-123!';const u=await authAdmin.createUser({email,password});users.push(u.uid);await db.collection('roles').doc(u.uid).set({role});const app=initializeApp({projectId:'demo-bosque-vivo',apiKey:'demo-key'},u.uid);apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);if(disabled)await db.collection('roles').doc(u.uid).set({role,disabled:true});const f=getFunctions(app,'us-central1');connectFunctionsEmulator(f,'127.0.0.1',5001);return {uid:u.uid,work:async v=>(await httpsCallable(f,'workspace')(v)).data};}
 try{
  for(const path of Object.values(paths))await bucket.file(path).save(Buffer.from([1,2,3]));
  await db.collection('species').doc(species).set({common_name:'QA Huérfanos',photo:paths.used,model_3d:paths.model,is_published:false});
  await db.collection('trash').doc(trashed).set({record:{common_name:'QA Papelera',photo:''},photos:[{id:'qa',data:{species_id:trashed,path:paths.trash}}],deleted_at:new Date()});
  const student=await account('student'),admin=await account('admin'),blocked=await account('admin',true);
  await assert.rejects(student.work({action:'orphanReport'}));
  await assert.rejects(blocked.work({action:'orphanReport'}),/bloqueada/);

  const mine=report=>Object.fromEntries(report.orphans.filter(o=>Object.values(paths).includes(o.path)).map(o=>[o.path,o.reason]));
  const fresh=await admin.work({action:'orphanReport'});
  assert.deepEqual(mine(fresh),{});assert.ok(fresh.recent>=4);assert.ok(fresh.referenced>=3);
  const later=await orphanReport({uid:admin.uid},Date.now()+8*24*60*60*1000);
  assert.deepEqual(mine(later),{[paths.loose]:'No referenciado',[paths.gone]:'Especie inexistente',[paths.proposal]:'Propuesta inexistente',[paths.other]:'Fuera de las carpetas conocidas'});
  assert.equal(later.scanned,later.referenced+later.recent+later.orphans.length);
  assert.equal(later.total_bytes,later.orphans.reduce((sum,o)=>sum+o.size,0));
  assert.ok(await bucket.file(paths.loose).exists().then(([found])=>found));
 }finally{
  for(const app of apps)await deleteApp(app);
  for(const path of Object.values(paths))await bucket.file(path).delete({ignoreNotFound:true});
  await db.collection('species').doc(species).delete();await db.collection('trash').doc(trashed).delete();
  for(const uid of users){await db.collection('roles').doc(uid).delete();await authAdmin.deleteUser(uid);}
 }
});
