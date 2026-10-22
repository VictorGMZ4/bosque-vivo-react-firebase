import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {db,bucket} from '../functions/firebase.js';
import {workspaceAction} from '../functions/workspace.js';
import {mutateData} from '../functions/service.js';
import {keyFor} from '../functions/domain.js';
test('teacher model and hotspots remain private until approval, survive correction and publish together',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');const suffix=String(Date.now()),teacher={uid:'qa-model-teacher-'+suffix,token:{}},admin={uid:'qa-model-admin-'+suffix,token:{}},student={uid:'qa-model-student-'+suffix,token:{}};
 const data={common_name:'QA Modelo '+suffix,scientific_name:'QA Modelo '+suffix,family:'QA',habit:'herb',is_published:false},hotspots=[{id:'leaf',title:'Hoja de prueba',description:'Texto sintético',position:[0,1,0],normal:[0,1,0]}];let id;
 for(const [a,role]of [[teacher,'teacher'],[admin,'admin'],[student,'student']])await db.collection('roles').doc(a.uid).set({role});
 try{
  await assert.rejects(workspaceAction(student,{action:'draftSubmission',data}));
  ({id}=await workspaceAction(teacher,{action:'draftSubmission',data}));
  const path=`submissions/${id}/models/qa.glb`;await bucket.file(path).save(readFileSync('public/models/welcome-plant.glb'),{metadata:{contentType:'model/gltf-binary'}});
  await assert.rejects(workspaceAction(teacher,{action:'submitDraft',id,model:{path:'submissions/foreign/models/qa.glb',hotspots,credit:''}}));
  await workspaceAction(teacher,{action:'submitDraft',id,model:{path,hotspots,credit:'Autor de prueba'}});
  assert.equal((await db.collection('species').doc(id).get()).exists,false);
  await assert.rejects(workspaceAction(teacher,{action:'reviewSpecies',id,decision:'approve'}));
  await workspaceAction(admin,{action:'reviewSpecies',id,decision:'reject',feedback:'Revisar descripción'});
  await workspaceAction(teacher,{action:'draftSubmission',id,data});
  assert.deepEqual((await db.collection('submissions').doc(id).get()).data().model.hotspots,hotspots);
  const revised=[{...hotspots[0],description:'Texto revisado'}];
  await workspaceAction(teacher,{action:'submitDraft',id,model:{path,hotspots:revised,credit:'Autor de prueba'}});
  await workspaceAction(admin,{action:'reviewSpecies',id,decision:'approve'});
  let record=(await db.collection('species').doc(id).get()).data();assert.deepEqual(record.model_hotspots,revised);assert.equal(record.model_credit,'Autor de prueba');assert.equal(record.model_3d,`species/${id}/models/qa.glb`);assert.equal((await bucket.file(record.model_3d).exists())[0],true);
  await assert.rejects(mutateData(teacher,{entity:'species',action:'update',id,data:{...data,model_3d:record.model_3d,model_hotspots:[]}}));
  await mutateData(admin,{entity:'species',action:'update',id,data:{...data,model_3d:record.model_3d,model_hotspots:[{...revised[0],position:[1,1,0]}]}});
  record=(await db.collection('species').doc(id).get()).data();assert.deepEqual(record.model_hotspots[0].position,[1,1,0]);
  await mutateData(admin,{entity:'species',action:'update',id,data:{...data,model_3d:''}});
  assert.deepEqual((await db.collection('species').doc(id).get()).data().model_hotspots,[]);
 }finally{
  if(id){for(const c of ['species','submissions'])await db.collection(c).doc(id).delete();const audit=await db.collection('audit').where('entity_id','==',id).get();for(const d of audit.docs)await d.ref.delete();await bucket.deleteFiles({prefix:`submissions/${id}/`});await bucket.deleteFiles({prefix:`species/${id}/`});}
  await db.collection('scientific_names').doc(keyFor(data.scientific_name)).delete();for(const a of [teacher,admin,student])await db.collection('roles').doc(a.uid).delete();const notes=await db.collection('notifications').get();for(const n of notes.docs)if(n.data().owner_id===teacher.uid||n.data().title.includes(suffix))await n.ref.delete();
 }
});
