import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectionsAction} from '../functions/collections.js';
import {db} from '../functions/firebase.js';
test('collections reject anonymous requests',async()=>{
 await assert.rejects(collectionsAction(null,{action:'collectionList'}),{code:'unauthenticated'});
});
test('private favorites validate publication, ownership and collection deletion',async()=>{
 if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080')throw Error('Use only the local Firestore emulator.');
 const key='collection-qa-'+Date.now(),owner={uid:key},other={uid:key+'-other'},species=db.collection('species').doc(key);
 try{
  await species.set({common_name:'QA',scientific_name:'QA species',is_published:true});
  const {id}=await collectionsAction(owner,{action:'collectionCreate',name:'Estudio'});
  await assert.rejects(collectionsAction(other,{action:'favoriteSave',species_id:key,collection_id:id}),/colección/i);
  await collectionsAction(owner,{action:'favoriteSave',species_id:key,collection_id:id});
  assert.equal((await collectionsAction(other,{action:'collectionList'})).favorites.length,0);
  assert.equal((await collectionsAction(owner,{action:'collectionList'})).favorites[0].species.common_name,'QA');
  await collectionsAction(owner,{action:'collectionDelete',id});
  assert.equal((await collectionsAction(owner,{action:'collectionList'})).favorites[0].collection_id,'');
  await species.update({is_published:false});
  const hidden=(await collectionsAction(owner,{action:'collectionList'})).favorites[0];
  assert.equal(hidden.unavailable,true);assert.equal(hidden.species,undefined);
  await assert.rejects(collectionsAction(owner,{action:'favoriteSave',species_id:key}),/publicada/i);
  await collectionsAction(owner,{action:'favoriteRemove',species_id:key});
  assert.equal((await collectionsAction(owner,{action:'collectionList'})).favorites.length,0);
  await assert.rejects(collectionsAction(owner,{action:'collectionCreate',name:' '}),/nombre/i);
  await species.update({is_published:true});
  const privateRef=db.collection('personal_collections').doc(owner.uid);
  await privateRef.set({collections:Array.from({length:20},(_,i)=>({id:'c'+i,name:'Colección '+i})),favorites:Array.from({length:100},(_,i)=>({species_id:'s'+i,collection_id:''}))});
  await assert.rejects(collectionsAction(owner,{action:'collectionCreate',name:'Exceso'}),{code:'resource-exhausted'});
  await assert.rejects(collectionsAction(owner,{action:'favoriteSave',species_id:key}),{code:'resource-exhausted'});
 }finally{await species.delete();await db.collection('personal_collections').doc(owner.uid).delete();await db.collection('personal_collections').doc(other.uid).delete();}
});
