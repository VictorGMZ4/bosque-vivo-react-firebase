import {test} from 'node:test';
import assert from 'node:assert/strict';
import {db} from '../functions/firebase.js';
import {mutateData} from '../functions/service.js';
import {keyFor} from '../functions/domain.js';

test('photo specimens generate unique codes and retain photos, counts and audit on update',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo');
 const suffix=String(Date.now()),auth={uid:'qa-specimen-photo-'+suffix,token:{}},species=[];
 await db.collection('roles').doc(auth.uid).set({role:'teacher'});
 const createSpecies=async name=>{const result=await mutateData(auth,{entity:'species',action:'create',data:{common_name:name,scientific_name:`QA specimen photo ${name} ${suffix}`,family:'QA'}});species.push(result.id);return result.id;};
 const read=async id=>(await db.collection('specimens').doc(id).get()).data();
 try{
  const id=await createSpecies('Girasol QA'),photo=`species/${id}/photos/qa.jpg`,data={photo,latitude:7.06,longitude:-73.85};
  const first=await mutateData(auth,{entity:'specimen',action:'create',species_id:id,data});
  assert.equal((await read(first.id)).code,'GIR-001');assert.equal((await read(first.id)).zone,'');
  const second=await mutateData(auth,{entity:'specimen',action:'create',species_id:id,data:{...data,code:'',zone:''}});
  assert.equal((await read(second.id)).code,'GIR-002');
  await assert.rejects(mutateData(auth,{entity:'specimen',action:'create',species_id:id,data:{...data,photo:'species/other/photos/qa.jpg'}}),{code:'invalid-argument'});
  await assert.rejects(mutateData(auth,{entity:'specimen',action:'update',id:first.id,data}),{code:'invalid-argument'});
  await mutateData(auth,{entity:'specimen',action:'update',id:first.id,data:{...data,code:'GIR-001',notes:'QA edit'}});
  assert.equal((await read(first.id)).code,'GIR-001');
  const parent=(await db.collection('species').doc(id).get()).data();assert.equal(parent.specimen_count,2);
  assert.deepEqual(parent.map_points.find(p=>p.id===first.id),{type:'specimen',id:first.id,path:photo,caption:'GIR-001',latitude:7.06,longitude:-73.85});
  assert.equal((await db.collection('specimen_codes').doc(keyFor('GIR-001')).get()).data().id,first.id);
  const audits=(await db.collection('audit').where('entity_id','==',first.id).get()).docs.map(d=>d.data());
  assert.equal(audits.find(a=>a.action==='create').after.photo,photo);assert.equal(audits.find(a=>a.action==='update').before.code,'GIR-001');
  const other=await createSpecies('Girasol QA colisiones');
  const third=await mutateData(auth,{entity:'specimen',action:'create',species_id:other,data:{}});
  assert.equal((await read(third.id)).code,'GIR-003');
  const batch=db.batch();for(let n=4;n<=52;n++)batch.create(db.collection('specimen_codes').doc(keyFor(`GIR-${String(n).padStart(3,'0')}`)),{id:auth.uid});await batch.commit();
  await assert.rejects(mutateData(auth,{entity:'specimen',action:'create',species_id:id,data:{}}),e=>e.code==='failed-precondition'&&/código único/.test(e.message));
  assert.equal((await db.collection('species').doc(id).get()).data().specimen_count,2);
 }finally{
  for(const id of species){for(const name of ['photos','specimens'])for(const d of (await db.collection(name).where('species_id','==',id).get()).docs){if(name==='specimens')await db.collection('specimen_codes').doc(keyFor(d.data().code)).delete();await d.ref.delete();}const s=(await db.collection('species').doc(id).get()).data();if(s)await db.collection('scientific_names').doc(keyFor(s.scientific_name)).delete();await db.collection('species').doc(id).delete();}
  for(const d of (await db.collection('specimen_codes').where('id','==',auth.uid).get()).docs)await d.ref.delete();
  for(const d of (await db.collection('audit').where('actor_id','==',auth.uid).get()).docs)await d.ref.delete();
  await db.collection('roles').doc(auth.uid).delete();
 }
});
