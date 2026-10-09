import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {getFirestore,connectFirestoreEmulator,doc,getDoc,setDoc} from 'firebase/firestore';
import {db,authAdmin} from '../functions/firebase.js';
import {keyFor} from '../functions/domain.js';

test('roles, personal profiles and transactional species moderation',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const stamp=Date.now(),users=[],apps=[],proposals=[];
 const data={common_name:'QA Propuesta',scientific_name:'QA propuesta '+stamp,family:'QA',habit:'herb',is_published:false};
 async function account(role,legacy=false){const email=`qa-${role}-${stamp}@example.test`,password='Local-test-123!';const u=await authAdmin.createUser({email,password});users.push(u.uid);if(legacy)await authAdmin.setCustomUserClaims(u.uid,{admin:true});await db.collection('roles').doc(u.uid).set({role});const app=initializeApp({projectId:'demo-bosque-vivo',apiKey:'demo-key'},u.uid);apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);const f=getFunctions(app,'us-central1');connectFunctionsEmulator(f,'127.0.0.1',5001);const store=getFirestore(app);connectFirestoreEmulator(store,'127.0.0.1',8080);return {uid:u.uid,store,work:async v=>(await httpsCallable(f,'workspace')(v)).data,mutate:async v=>(await httpsCallable(f,'mutate')(v)).data};}
 try{
  const student=await account('student'),teacher=await account('teacher'),admin=await account('admin',true);
  await student.work({action:'saveProfile',data:{name:'Estudiante QA',institution:'UNIPAZ',bio:'Perfil propio'}});
  assert.equal((await getDoc(doc(student.store,'profiles',student.uid))).data().name,'Estudiante QA');
  await assert.rejects(student.work({action:'saveProfile',data:{name:'QA',role:'admin'}}));
  await assert.rejects(student.work({action:'setRole',uid:teacher.uid,role:'admin'}));
  await assert.rejects(setDoc(doc(student.store,'roles',student.uid),{role:'admin'}));
  await assert.rejects(student.work({action:'listUsers'}));
  await assert.rejects(getDoc(doc(teacher.store,'profiles',student.uid)));
  await assert.rejects(student.work({action:'submitSpecies',data}));
  await assert.rejects(teacher.mutate({entity:'species',action:'create',data}));
  await assert.rejects(teacher.work({action:'submitSpecies',data:{...data,is_published:true}}));
  const proposal=await teacher.work({action:'submitSpecies',data});proposals.push(proposal.id);
  assert.equal((await db.collection('species').doc(proposal.id).get()).exists,false);
  await getDoc(doc(teacher.store,'submissions',proposal.id));await assert.rejects(getDoc(doc(student.store,'submissions',proposal.id)));
  await assert.rejects(teacher.work({action:'reviewSpecies',id:proposal.id,decision:'approve'}));
  await admin.work({action:'reviewSpecies',id:proposal.id,decision:'approve'});
  assert.equal((await getDoc(doc(student.store,'species',proposal.id))).data().is_published,true);
  await assert.rejects(admin.work({action:'reviewSpecies',id:proposal.id,decision:'approve'}));
  const rejected=await teacher.work({action:'submitSpecies',data:{...data,scientific_name:data.scientific_name+' reject'}});proposals.push(rejected.id);
  await assert.rejects(admin.work({action:'reviewSpecies',id:rejected.id,decision:'reject'}));
  await admin.work({action:'reviewSpecies',id:rejected.id,decision:'reject',feedback:'Faltan fuentes'});
  assert.equal((await db.collection('species').doc(rejected.id).get()).exists,false);
  await assert.rejects(admin.work({action:'setRole',uid:admin.uid,role:'student'}));
  await student.work({action:'requestTeacher'});
  assert.equal((await db.collection('roles').doc(student.uid).get()).data().role,'student');
  await assert.rejects(student.work({action:'reviewAccount',uid:student.uid,decision:'approve'}));
  await assert.rejects(teacher.work({action:'reviewAccount',uid:student.uid,decision:'approve'}));
  await assert.rejects(admin.work({action:'reviewAccount',uid:student.uid,decision:'reject'}));
  await admin.work({action:'reviewAccount',uid:student.uid,decision:'reject',feedback:'Verificar vinculación'});
  await student.work({action:'requestTeacher'});
  await admin.work({action:'reviewAccount',uid:student.uid,decision:'approve'});
  await assert.rejects(admin.work({action:'reviewAccount',uid:student.uid,decision:'approve'}));
  const upgraded=await student.work({action:'submitSpecies',data:{...data,scientific_name:data.scientific_name+' promoted'}});proposals.push(upgraded.id);
  await db.collection('roles').doc(admin.uid).set({role:'student'});
  await assert.rejects(admin.mutate({entity:'species',action:'create',data}));
  await assert.rejects(admin.work({action:'listUsers'}));
  await assert.rejects(getDoc(doc(admin.store,'submissions',rejected.id)));
 }finally{
  for(const app of apps)await deleteApp(app);
  for(const id of proposals){await db.collection('submissions').doc(id).delete();await db.collection('species').doc(id).delete();}
  await db.collection('scientific_names').doc(keyFor(data.scientific_name)).delete();
  for(const uid of users){await db.collection('roles').doc(uid).delete();await db.collection('role_requests').doc(uid).delete();await db.collection('profiles').doc(uid).delete();await authAdmin.deleteUser(uid);}
 }
});
