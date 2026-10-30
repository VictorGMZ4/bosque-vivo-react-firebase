import {test} from 'node:test';
import assert from 'node:assert/strict';
import {db,bucket} from '../functions/firebase.js';
import {mutateData} from '../functions/service.js';
import {workspaceAction} from '../functions/workspace.js';
import {keyFor} from '../functions/domain.js';

test('map points follow photos, specimens and approved proposals',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const suffix=String(Date.now()),admin={uid:'qa-map-admin-'+suffix,token:{}},student={uid:'qa-map-student-'+suffix,token:{}},species=[],files=[];
 const here={latitude:7.0651,longitude:-73.8542,source:'exif'},there={latitude:7.0702,longitude:-73.8601,source:'manual'};
 const data=name=>({common_name:'QA Mapa '+name,scientific_name:`QA mapa ${name} ${suffix}`,family:'QA',habit:'tree',is_published:true});
 const points=async id=>((await db.collection('species').doc(id).get()).data().map_points||[]).map(p=>[p.type,p.latitude,p.longitude]);
 for(const [a,role]of [[admin,'admin'],[student,'student']])await db.collection('roles').doc(a.uid).set({role});
 try{
  const {id}=await mutateData(admin,{entity:'species',action:'create',data:data('Ficha')});species.push(id);
  assert.deepEqual(await points(id),[]);
  const cover=`species/${id}/photos/cover.jpg`;
  await mutateData(admin,{entity:'species',action:'update',id,data:{...data('Ficha'),photo:cover,photo_location:here}});
  assert.deepEqual(await points(id),[['photo',here.latitude,here.longitude]]);
  await assert.rejects(mutateData(admin,{entity:'photo',action:'create',species_id:id,data:{path:`species/${id}/photos/bad.jpg`,caption:'Mala',location:{latitude:100,longitude:0,source:'exif'}}}));
  const {id:photo}=await mutateData(admin,{entity:'photo',action:'create',species_id:id,data:{path:`species/${id}/photos/flor.jpg`,caption:'Flor',location:there}});
  const {id:specimen}=await mutateData(admin,{entity:'specimen',action:'create',species_id:id,data:{code:'QA-MAP-'+suffix,zone:'Jardín',latitude:'7.08',longitude:'-73.87'}});
  assert.deepEqual(await points(id),[['photo',here.latitude,here.longitude],['photo',there.latitude,there.longitude],['specimen',7.08,-73.87]]);
  await mutateData(admin,{entity:'photo',action:'update',id:photo,data:{path:`species/${id}/photos/flor.jpg`,caption:'Flor abierta',position:1}});
  assert.equal((await db.collection('photos').doc(photo).get()).data().location.source,'manual');
  await mutateData(admin,{entity:'photo',action:'update',id:photo,data:{path:`species/${id}/photos/flor.jpg`,caption:'Flor abierta',location:null}});
  await mutateData(admin,{entity:'specimen',action:'delete',id:specimen});
  await mutateData(admin,{entity:'species',action:'update',id,data:{...data('Ficha'),photo:''}});
  assert.deepEqual(await points(id),[]);
  await mutateData(admin,{entity:'photo',action:'delete',id:photo});

  const {id:draft}=await workspaceAction(student,{action:'draftSubmission',data:{...data('Propuesta'),is_published:false}});species.push(draft);
  const path=`submissions/${draft}/photos/campo.png`;files.push(path,`species/${draft}/photos/campo.png`);await bucket.file(path).save(Buffer.from([1,2,3]),{metadata:{contentType:'image/png'}});
  await assert.rejects(workspaceAction(student,{action:'submitDraft',id:draft,photos:[{path,caption:'Campo',credit:'',location:{latitude:7,longitude:-73,source:'gps'}}]}));
  await workspaceAction(student,{action:'submitDraft',id:draft,photos:[{path,caption:'Campo',credit:'',location:here}]});
  await workspaceAction(admin,{action:'reviewSpecies',id:draft,decision:'approve'});
  const approved=(await db.collection('species').doc(draft).get()).data();
  assert.deepEqual(approved.photo_location,here);assert.deepEqual(await points(draft),[['photo',here.latitude,here.longitude]]);
  assert.deepEqual((await db.collection('photos').doc(`${draft}_0`).get()).data().location,here);
 }finally{
  for(const path of files)await bucket.file(path).delete({ignoreNotFound:true});
  for(const id of species){const s=(await db.collection('species').doc(id).get()).data();if(s)await db.collection('scientific_names').doc(keyFor(s.scientific_name)).delete();for(const name of ['species','submissions','trash'])await db.collection(name).doc(id).delete();for(const name of ['photos','specimens'])for(const d of (await db.collection(name).where('species_id','==',id).get()).docs)await d.ref.delete();for(const d of (await db.collection('audit').where('entity_id','==',id).get()).docs)await d.ref.delete();}
  await db.collection('specimen_codes').doc(keyFor('QA-MAP-'+suffix)).delete();
  for(const d of (await db.collection('notifications').get()).docs)if(d.data().owner_id===student.uid||/QA Mapa /.test(d.data().title))await d.ref.delete();
  for(const a of [admin,student]){await db.collection('roles').doc(a.uid).delete();await db.collection('submission_limits').doc(a.uid).delete();}
 }
});
