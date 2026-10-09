import {test} from 'node:test';
import assert from 'node:assert/strict';
import {db,bucket} from '../functions/firebase.js';
import {workspaceAction} from '../functions/workspace.js';
import {mutateData} from '../functions/service.js';
import {keyFor} from '../functions/domain.js';
test('proposal correction, immutable photos, notifications and trash restoration',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');const suffix=String(Date.now()),teacher={uid:'qa-teacher-'+suffix,token:{}},admin={uid:'qa-admin-'+suffix,token:{}},other={uid:'qa-other-'+suffix,token:{}};
 const data={common_name:'QA Revisión '+suffix,scientific_name:'QA Revision '+suffix,family:'QA',habit:'herb',is_published:false};let id,notificationIds=[];
 for(const [auth,role]of [[teacher,'teacher'],[admin,'admin'],[other,'student']])await db.collection('roles').doc(auth.uid).set({role});
 try{
  ({id}=await workspaceAction(teacher,{action:'draftSubmission',data}));
  const path=`submissions/${id}/photos/qa.png`;await bucket.file(path).save(Buffer.from([1,2,3]),{metadata:{contentType:'image/png'}});
  await assert.rejects(workspaceAction(other,{action:'submitDraft',id,photos:[]}));
  await workspaceAction(teacher,{action:'submitDraft',id,photos:[{path,caption:'QA imagen',credit:'QA autor'}]});
  await assert.rejects(workspaceAction(teacher,{action:'draftSubmission',id,data}));
  await workspaceAction(admin,{action:'reviewSpecies',id,decision:'reject',feedback:'Completa las fuentes'});
  await workspaceAction(teacher,{action:'draftSubmission',id,data:{...data,references:'Fuentes QA añadidas'}});
  await workspaceAction(teacher,{action:'submitDraft',id,photos:[{path,caption:'QA imagen',credit:'QA autor'}]});
  await workspaceAction(admin,{action:'reviewSpecies',id,decision:'approve'});
  const record=(await db.collection('species').doc(id).get()).data();assert.equal(record.is_published,true);assert.equal(record.photo_credit,'QA autor');assert.equal((await db.collection('submissions').doc(id).get()).data().history.length,2);
  const notes=await workspaceAction(teacher,{action:'notificationsList'});assert.equal(notes.items.length,2);notificationIds=notes.items.map(n=>n.id);await assert.rejects(workspaceAction(other,{action:'notificationRead',id:notes.items[0].id}));await workspaceAction(teacher,{action:'notificationRead',id:notes.items[0].id});assert((await workspaceAction(teacher,{action:'notificationsList'})).items.find(n=>n.id===notes.items[0].id).read);
  await mutateData(admin,{entity:'species',action:'delete',id});assert.equal((await db.collection('species').doc(id).get()).exists,false);assert((await db.collection('trash').doc(id).get()).exists);
  await assert.rejects(workspaceAction(teacher,{action:'restoreSpecies',id}));await db.collection('scientific_names').doc(keyFor(data.scientific_name)).set({id:'qa-conflict'});await assert.rejects(workspaceAction(admin,{action:'restoreSpecies',id}));await db.collection('scientific_names').doc(keyFor(data.scientific_name)).delete();
  await workspaceAction(admin,{action:'restoreSpecies',id});assert.equal((await db.collection('species').doc(id).get()).data().is_published,false);assert.equal((await db.collection('photos').where('species_id','==',id).get()).size,1);
  const audit=await workspaceAction(admin,{action:'historyList',id});assert.equal(audit.items.length,3);assert.equal(audit.items.find(e=>e.action==='restore').after.is_published,false);assert.equal(audit.items.find(e=>e.action==='approve').after.is_published,true);assert.equal(audit.items.find(e=>e.action==='approve').after.photo,record.photo);
 }finally{
  if(id){for(const name of ['species','submissions','trash'])await db.collection(name).doc(id).delete();for(const name of ['audit','photos']){const docs=await db.collection(name).where(name==='audit'?'entity_id':'species_id','==',id).get();for(const d of docs.docs)await d.ref.delete();}await bucket.deleteFiles({prefix:`submissions/${id}/`});await bucket.deleteFiles({prefix:`species/${id}/`});}
  await db.collection('scientific_names').doc(keyFor(data.scientific_name)).delete();for(const auth of [teacher,admin,other])await db.collection('roles').doc(auth.uid).delete();
  const all=await db.collection('notifications').get();for(const n of all.docs)if(n.data().owner_id===teacher.uid||n.data().title.includes(suffix)){await n.ref.delete();await db.collection('notification_reads').doc(teacher.uid).collection('items').doc(n.id).delete();}
 }
});
