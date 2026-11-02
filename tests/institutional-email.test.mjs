import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {getFirestore,connectFirestoreEmulator,doc,getDoc} from 'firebase/firestore';
import {getStorage,connectStorageEmulator,ref,uploadBytes} from 'firebase/storage';
import {db,authAdmin,bucket} from '../functions/firebase.js';
import {workspaceAction} from '../functions/workspace.js';
import {keyFor} from '../functions/domain.js';

test('researchers publish and edit their own species; students propose once a day and researchers review',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const stamp=Date.now(),users=[],apps=[],species=[],submissions=[],files=[];
 const plant=name=>({common_name:'QA '+name+' '+stamp,scientific_name:`QA ${name} ${stamp}`,family:'QA',habit:'herb'});
 const image={contentType:'image/png'},bytes=new Uint8Array([1,2,3]);
 async function account(role){const email=`qa-institutional-${role}-${users.length}-${stamp}@unipaz.edu.co`,password='Local-test-123!';const u=await authAdmin.createUser({email,password,emailVerified:true});users.push(u.uid);if(role==='researcher')await workspaceAction({uid:users[0]},{action:'setRole',uid:u.uid,role});else await db.collection('roles').doc(u.uid).set({role});const app=initializeApp({projectId:'demo-bosque-vivo',apiKey:'demo-key',storageBucket:'demo-bosque-vivo.firebasestorage.app'},u.uid);apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);const f=getFunctions(app,'us-central1');connectFunctionsEmulator(f,'127.0.0.1',5001);const store=getFirestore(app);connectFirestoreEmulator(store,'127.0.0.1',8080);const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199);return {uid:u.uid,store,storage,work:async v=>(await httpsCallable(f,'workspace')(v)).data,mutate:async v=>(await httpsCallable(f,'mutate')(v)).data};}
 const upload=async(user,path)=>{files.push(path);await uploadBytes(ref(user.storage,path),bytes,image);};
 try{
  const admin=await account('admin'),researcher=await account('researcher'),other=await account('researcher'),student=await account('student');

  // Profesor: publica directamente y edita solo lo suyo.
  const own=(await researcher.mutate({entity:'species',action:'create',data:{...plant('Propia'),is_published:true}})).id;species.push(own);
  const record=(await db.collection('species').doc(own).get()).data();assert.equal(record.created_by,researcher.uid);assert.equal(record.is_published,true);
  await researcher.mutate({entity:'species',action:'update',id:own,data:{...plant('Propia'),description:'Editada',is_published:false}});
  assert.equal((await getDoc(doc(researcher.store,'species',own))).data().description,'Editada');
  await assert.rejects(getDoc(doc(other.store,'species',own)));
  const specimen=(await researcher.mutate({entity:'specimen',action:'create',species_id:own,data:{code:'QA-'+stamp,zone:'Zona QA'}})).id;
  await researcher.mutate({entity:'specimen',action:'update',id:specimen,data:{code:'QA-'+stamp,zone:'Zona revisada'}});
  await upload(researcher,`species/${own}/photos/own.png`);
  await assert.rejects(other.mutate({entity:'species',action:'update',id:own,data:plant('Propia')}),/registraste/);
  await assert.rejects(other.mutate({entity:'specimen',action:'create',species_id:own,data:{code:'QA-B-'+stamp,zone:'Zona QA'}}),/registraste/);
  await assert.rejects(uploadBytes(ref(other.storage,`species/${own}/photos/foreign.png`),bytes,image),/unauthorized/i);
  await assert.rejects(researcher.mutate({entity:'specimen',action:'delete',id:specimen}),/administración/);
  await assert.rejects(researcher.mutate({entity:'species',action:'delete',id:own}),/administración/);
  const adminSpecies=(await admin.mutate({entity:'species',action:'create',data:{...plant('Admin'),is_published:false}})).id;species.push(adminSpecies);
  await assert.rejects(researcher.mutate({entity:'species',action:'update',id:adminSpecies,data:plant('Admin')}),/registraste/);
  await assert.rejects(student.mutate({entity:'species',action:'create',data:plant('Estudiante')}));
  await db.collection('species').doc(adminSpecies).update({submitted_by:researcher.uid});
  await researcher.mutate({entity:'species',action:'update',id:adminSpecies,data:{...plant('Admin'),is_published:false,description:'Autor de propuesta'}});
  assert.equal((await getDoc(doc(researcher.store,'species',adminSpecies))).data().description,'Autor de propuesta');
  await upload(researcher,`species/${adminSpecies}/photos/submitted.png`);

  // Estudiante: un borrador abierto, sin modelo 3D y un envío cada 24 horas.
  const draft=(await student.work({action:'draftSubmission',data:plant('Borrador')})).id;submissions.push(draft);
  await assert.rejects(student.work({action:'draftSubmission',data:plant('Segundo')}),/borrador abierto/);
  await upload(student,`submissions/${draft}/photos/campo.png`);
  await assert.rejects(student.work({action:'submitDraft',id:draft,photos:[],model:{path:`submissions/${draft}/models/qa.glb`,hotspots:[],credit:''}}),/modelos 3D/);
  await assert.rejects(getDoc(doc(researcher.store,'submissions',draft)));
  await student.work({action:'submitDraft',id:draft,photos:[{path:`submissions/${draft}/photos/campo.png`,caption:'Foto de campo',credit:'Estudiante QA'}]});
  await assert.rejects(student.work({action:'submitSpecies',data:plant('Rápida')}),/24 horas/);

  // Revisión por profesores, nunca la propia.
  assert.equal((await getDoc(doc(researcher.store,'submissions',draft))).data().status,'pending');
  const notice=(await researcher.work({action:'notificationsList'})).items.find(n=>n.title.includes(plant('Borrador').common_name));assert.ok(notice);
  await researcher.work({action:'notificationRead',id:notice.id});assert.equal((await researcher.work({action:'notificationsList'})).items.find(n=>n.id===notice.id).read,true);
  assert.equal(Object.keys((await researcher.work({action:'submissionAuthors',ids:[draft]})).authors)[0],student.uid);
  await assert.rejects(student.work({action:'reviewSpecies',id:draft,decision:'reject',feedback:'No'}));
  await researcher.work({action:'reviewSpecies',id:draft,decision:'reject',feedback:'Añade fuentes'});
  await student.work({action:'draftSubmission',id:draft,data:{...plant('Borrador'),references:'Fuente QA'}});
  await student.work({action:'submitDraft',id:draft,photos:[{path:`submissions/${draft}/photos/campo.png`,caption:'Foto de campo',credit:'Estudiante QA'}]});
  await other.work({action:'reviewSpecies',id:draft,decision:'approve'});species.push(draft);
  const approved=(await db.collection('species').doc(draft).get()).data();assert.equal(approved.approved_by,other.uid);assert.equal(approved.submitted_by,student.uid);
  files.push(`species/${draft}/photos/campo.png`);

  const mine=(await researcher.work({action:'draftSubmission',data:plant('Del profesor')})).id;submissions.push(mine);
  await researcher.work({action:'submitDraft',id:mine,photos:[]});
  await assert.rejects(researcher.work({action:'reviewSpecies',id:mine,decision:'approve'}),/propia/);

  await db.collection('submission_limits').doc(student.uid).set({last_sent_at:new Date(Date.now()-25*60*60*1000)});
  const later=(await student.work({action:'submitSpecies',data:plant('Al día siguiente')})).id;submissions.push(later);
  assert.equal((await db.collection('submissions').doc(later).get()).data().status,'pending');
 }finally{
  for(const app of apps)await deleteApp(app);
  for(const path of files)await bucket.file(path).delete({ignoreNotFound:true});
  for(const id of species){const s=(await db.collection('species').doc(id).get()).data();if(s)await db.collection('scientific_names').doc(keyFor(s.scientific_name)).delete();await db.collection('species').doc(id).delete();for(const name of ['specimens','photos'])for(const d of (await db.collection(name).where('species_id','==',id).get()).docs){if(name==='specimens')await db.collection('specimen_codes').doc(keyFor(d.data().code)).delete();await d.ref.delete();}}
  for(const id of [...species,...submissions]){await db.collection('submissions').doc(id).delete();for(const d of (await db.collection('audit').where('entity_id','==',id).get()).docs)await d.ref.delete();}
  for(const d of (await db.collection('notifications').where('audience','==','reviewers').get()).docs)if(d.data().title.includes(String(stamp))||/QA (Borrador|Del profesor|Al día siguiente)/.test(d.data().title))await d.ref.delete();
  for(const uid of users){for(const d of (await db.collection('audit').where('actor_id','==',uid).get()).docs)await d.ref.delete();for(const d of (await db.collection('notifications').where('owner_id','==',uid).get()).docs)await d.ref.delete();await db.recursiveDelete(db.collection('notification_reads').doc(uid));await db.collection('submission_limits').doc(uid).delete();await db.collection('roles').doc(uid).delete();await authAdmin.deleteUser(uid);}
 }
});

test('institutional verified email gates staff assignments and approvals',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');const stamp=Date.now(),users=[];
 const domain='Para ser profesor o investigador, la cuenta debe usar un correo institucional @unipaz.edu.co.',verification='La cuenta debe verificar su correo institucional antes de recibir este rol.';
 async function account(domain,emailVerified=false){const u=await authAdmin.createUser({...domain?{email:'qa-gate-'+users.length+'-'+stamp+'@'+domain}:{},emailVerified});users.push(u.uid);return {uid:u.uid};}
 try{
  const admin=await account('example.test');await db.collection('roles').doc(admin.uid).set({role:'admin'});
  const gmail=await account('gmail.com',true),missing=await account(),unverified=await account('unipaz.edu.co'),verified=await account('UNIPAZ.EDU.CO',true);
  for(const role of ['teacher','researcher']){
   for(const target of [gmail,missing])await assert.rejects(workspaceAction(admin,{action:'setRole',uid:target.uid,role}),{code:'failed-precondition',message:domain});
   await assert.rejects(workspaceAction(admin,{action:'setRole',uid:unverified.uid,role}),{code:'failed-precondition',message:verification});
   await workspaceAction(admin,{action:'setRole',uid:verified.uid,role});assert.equal((await db.collection('roles').doc(verified.uid).get()).data().role,role);
  }
  for(const target of [gmail,missing,unverified])assert.equal((await db.collection('roles').doc(target.uid).get()).exists,false);
  for(const role of ['admin','student'])await workspaceAction(admin,{action:'setRole',uid:gmail.uid,role});
  for(const [target,message] of [[gmail,domain],[unverified,verification]]){
   await db.collection('role_requests').doc(target.uid).set({status:'pending',owner_id:target.uid});
   await assert.rejects(workspaceAction(admin,{action:'reviewAccount',uid:target.uid,decision:'approve'}),{code:'failed-precondition',message});
   assert.equal((await db.collection('role_requests').doc(target.uid).get()).data().status,'pending');
  }
  let cursorBefore,listedBefore;do{const page=await workspaceAction(admin,{action:'listUsers',cursor:cursorBefore});listedBefore=page.users.find(u=>u.uid===unverified.uid);cursorBefore=page.cursor;}while(!listedBefore&&cursorBefore);assert.equal(listedBefore.institutional,true);assert.equal(listedBefore.email_verified,false);
  await authAdmin.updateUser(unverified.uid,{emailVerified:true});await workspaceAction(admin,{action:'reviewAccount',uid:unverified.uid,decision:'approve'});
  const listed=[];let cursor;do{const page=await workspaceAction(admin,{action:'listUsers',cursor});listed.push(...page.users);cursor=page.cursor;}while(cursor);
  for(const [target,institutional,email_verified] of [[gmail,false,true],[missing,false,false],[unverified,true,true],[verified,true,true]]){const u=listed.find(u=>u.uid===target.uid);assert.equal(u.institutional,institutional);assert.equal(u.email_verified,email_verified);}
 }finally{for(const uid of users){for(const name of ['roles','role_requests'])await db.collection(name).doc(uid).delete();for(const d of (await db.collection('notifications').where('owner_id','==',uid).get()).docs)await d.ref.delete();await authAdmin.deleteUser(uid);}}
});
