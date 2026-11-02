import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword} from 'firebase/auth';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {getFirestore,connectFirestoreEmulator,doc,getDoc} from 'firebase/firestore';
import {getStorage,connectStorageEmulator,ref,uploadBytes} from 'firebase/storage';
import {db,authAdmin,bucket} from '../functions/firebase.js';
import {keyFor} from '../functions/domain.js';

test('teachers publish and edit their own species; students propose once a day and teachers review',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const stamp=Date.now(),users=[],apps=[],species=[],submissions=[],files=[];
 const plant=name=>({common_name:'QA '+name,scientific_name:`QA ${name} ${stamp}`,family:'QA',habit:'herb'});
 const image={contentType:'image/png'},bytes=new Uint8Array([1,2,3]);
 async function account(role){const email=`qa-contrib-${role}-${users.length}-${stamp}@unipaz.edu.co`,password='Local-test-123!';const u=await authAdmin.createUser({email,password,emailVerified:true});users.push(u.uid);await db.collection('roles').doc(u.uid).set({role});const app=initializeApp({projectId:'demo-bosque-vivo',apiKey:'demo-key',storageBucket:'demo-bosque-vivo.firebasestorage.app'},u.uid);apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});await signInWithEmailAndPassword(auth,email,password);const f=getFunctions(app,'us-central1');connectFunctionsEmulator(f,'127.0.0.1',5001);const store=getFirestore(app);connectFirestoreEmulator(store,'127.0.0.1',8080);const storage=getStorage(app);connectStorageEmulator(storage,'127.0.0.1',9199);return {uid:u.uid,store,storage,work:async v=>(await httpsCallable(f,'workspace')(v)).data,mutate:async v=>(await httpsCallable(f,'mutate')(v)).data};}
 const upload=async(user,path)=>{files.push(path);await uploadBytes(ref(user.storage,path),bytes,image);};
 try{
  const admin=await account('admin'),teacher=await account('teacher'),other=await account('teacher'),student=await account('student');

  // Profesor: publica directamente y edita solo lo suyo.
  const own=(await teacher.mutate({entity:'species',action:'create',data:{...plant('Propia'),is_published:true}})).id;species.push(own);
  const record=(await db.collection('species').doc(own).get()).data();assert.equal(record.created_by,teacher.uid);assert.equal(record.is_published,true);
  await teacher.mutate({entity:'species',action:'update',id:own,data:{...plant('Propia'),description:'Editada',is_published:false}});
  assert.equal((await getDoc(doc(teacher.store,'species',own))).data().description,'Editada');
  await assert.rejects(getDoc(doc(other.store,'species',own)));
  const specimen=(await teacher.mutate({entity:'specimen',action:'create',species_id:own,data:{code:'QA-'+stamp,zone:'Zona QA'}})).id;
  await teacher.mutate({entity:'specimen',action:'update',id:specimen,data:{code:'QA-'+stamp,zone:'Zona revisada'}});
  await upload(teacher,`species/${own}/photos/own.png`);
  await assert.rejects(other.mutate({entity:'species',action:'update',id:own,data:plant('Propia')}),/registraste/);
  await assert.rejects(other.mutate({entity:'specimen',action:'create',species_id:own,data:{code:'QA-B-'+stamp,zone:'Zona QA'}}),/registraste/);
  await assert.rejects(uploadBytes(ref(other.storage,`species/${own}/photos/foreign.png`),bytes,image),/unauthorized/i);
  await assert.rejects(teacher.mutate({entity:'specimen',action:'delete',id:specimen}),/administración/);
  await assert.rejects(teacher.mutate({entity:'species',action:'delete',id:own}),/administración/);
  const adminSpecies=(await admin.mutate({entity:'species',action:'create',data:{...plant('Admin'),is_published:false}})).id;species.push(adminSpecies);
  await assert.rejects(teacher.mutate({entity:'species',action:'update',id:adminSpecies,data:plant('Admin')}),/registraste/);
  await assert.rejects(student.mutate({entity:'species',action:'create',data:plant('Estudiante')}));

  // Estudiante: un borrador abierto, sin modelo 3D y un envío cada 24 horas.
  const draft=(await student.work({action:'draftSubmission',data:plant('Borrador')})).id;submissions.push(draft);
  await assert.rejects(student.work({action:'draftSubmission',data:plant('Segundo')}),/borrador abierto/);
  await upload(student,`submissions/${draft}/photos/campo.png`);
  await assert.rejects(student.work({action:'submitDraft',id:draft,photos:[],model:{path:`submissions/${draft}/models/qa.glb`,hotspots:[],credit:''}}),/modelos 3D/);
  await assert.rejects(getDoc(doc(teacher.store,'submissions',draft)));
  await student.work({action:'submitDraft',id:draft,photos:[{path:`submissions/${draft}/photos/campo.png`,caption:'Foto de campo',credit:'Estudiante QA'}]});
  await assert.rejects(student.work({action:'submitSpecies',data:plant('Rápida')}),/24 horas/);

  // Revisión por profesores, nunca la propia.
  assert.equal((await getDoc(doc(teacher.store,'submissions',draft))).data().status,'pending');
  assert.ok((await teacher.work({action:'notificationsList'})).items.some(n=>n.title.includes(plant('Borrador').common_name)));
  assert.equal(Object.keys((await teacher.work({action:'submissionAuthors',ids:[draft]})).authors)[0],student.uid);
  await assert.rejects(student.work({action:'reviewSpecies',id:draft,decision:'reject',feedback:'No'}));
  await teacher.work({action:'reviewSpecies',id:draft,decision:'reject',feedback:'Añade fuentes'});
  await student.work({action:'draftSubmission',id:draft,data:{...plant('Borrador'),references:'Fuente QA'}});
  await student.work({action:'submitDraft',id:draft,photos:[{path:`submissions/${draft}/photos/campo.png`,caption:'Foto de campo',credit:'Estudiante QA'}]});
  await other.work({action:'reviewSpecies',id:draft,decision:'approve'});species.push(draft);
  const approved=(await db.collection('species').doc(draft).get()).data();assert.equal(approved.approved_by,other.uid);assert.equal(approved.submitted_by,student.uid);
  files.push(`species/${draft}/photos/campo.png`);

  const mine=(await teacher.work({action:'draftSubmission',data:plant('Del profesor')})).id;submissions.push(mine);
  await teacher.work({action:'submitDraft',id:mine,photos:[]});
  await assert.rejects(teacher.work({action:'reviewSpecies',id:mine,decision:'approve'}),/propia/);

  await db.collection('submission_limits').doc(student.uid).set({last_sent_at:new Date(Date.now()-25*60*60*1000)});
  const later=(await student.work({action:'submitSpecies',data:plant('Al día siguiente')})).id;submissions.push(later);
  assert.equal((await db.collection('submissions').doc(later).get()).data().status,'pending');
 }finally{
  for(const app of apps)await deleteApp(app);
  for(const path of files)await bucket.file(path).delete({ignoreNotFound:true});
  for(const id of species){const s=(await db.collection('species').doc(id).get()).data();if(s)await db.collection('scientific_names').doc(keyFor(s.scientific_name)).delete();await db.collection('species').doc(id).delete();for(const name of ['specimens','photos'])for(const d of (await db.collection(name).where('species_id','==',id).get()).docs){if(name==='specimens')await db.collection('specimen_codes').doc(keyFor(d.data().code)).delete();await d.ref.delete();}}
  for(const id of [...species,...submissions]){await db.collection('submissions').doc(id).delete();for(const d of (await db.collection('audit').where('entity_id','==',id).get()).docs)await d.ref.delete();}
  for(const d of (await db.collection('notifications').where('audience','==','reviewers').get()).docs)if(d.data().title.includes(String(stamp))||/QA (Borrador|Del profesor|Al día siguiente)/.test(d.data().title))await d.ref.delete();
  for(const uid of users){for(const d of (await db.collection('notifications').where('owner_id','==',uid).get()).docs)await d.ref.delete();await db.collection('submission_limits').doc(uid).delete();await db.collection('roles').doc(uid).delete();await authAdmin.deleteUser(uid);}
 }
});
