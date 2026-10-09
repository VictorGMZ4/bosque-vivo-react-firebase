import {randomUUID} from 'node:crypto';
import {FieldValue} from 'firebase-admin/firestore';
import {db} from './firebase.js';
import {fail,validateId} from './domain.js';

export async function collectionsAction(auth,input){
 if(!auth)fail('Inicia sesión para guardar especies.','unauthenticated');
 if(!input||typeof input!=='object'||Array.isArray(input))fail('Solicitud inválida.');
 const ref=db.collection('personal_collections').doc(auth.uid);
 if(input.action==='collectionList'){
  const data=(await ref.get()).data()||{collections:[],favorites:[]};
  const favorites=await Promise.all(data.favorites.map(async favorite=>{
   const snapshot=await db.collection('species').doc(favorite.species_id).get(),plant=snapshot.data();
   if(!snapshot.exists||plant.is_published!==true)return {...favorite,unavailable:true};
   return {...favorite,species:{id:snapshot.id,common_name:plant.common_name,scientific_name:plant.scientific_name,photo:plant.photo||'',family:plant.family||'',habit:plant.habit||''}};
  }));
  return {collections:data.collections,favorites};
 }
 return db.runTransaction(async tx=>{
  const snapshot=await tx.get(ref),data=snapshot.data()||{collections:[],favorites:[]};let result={saved:true};
  if(input.action==='collectionCreate'){
   if(typeof input.name!=='string'||!input.name.trim()||input.name.trim().length>60)fail('Escribe un nombre de hasta 60 caracteres.');
   const name=input.name.trim();if(data.collections.some(c=>c.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es')))fail('Ya tienes una colección con ese nombre.');
   if(data.collections.length>=20)fail('Puedes crear hasta 20 colecciones.','resource-exhausted');
   const id=randomUUID();data.collections.push({id,name});result={id};
  }else if(input.action==='collectionDelete'){
   const id=validateId(input.id);if(!data.collections.some(c=>c.id===id))fail('La colección no existe.','not-found');
   data.collections=data.collections.filter(c=>c.id!==id);data.favorites=data.favorites.map(f=>f.collection_id===id?{...f,collection_id:''}:f);
  }else if(input.action==='favoriteSave'){
   const id=validateId(input.species_id),collectionId=input.collection_id==null||input.collection_id===''?'':validateId(input.collection_id);
   if(collectionId&&!data.collections.some(c=>c.id===collectionId))fail('La colección no existe.','not-found');
   const species=await tx.get(db.collection('species').doc(id));if(!species.exists||species.data().is_published!==true)fail('La especie ya no está publicada.','failed-precondition');
   const index=data.favorites.findIndex(f=>f.species_id===id);
   if(index<0&&data.favorites.length>=100)fail('Puedes guardar hasta 100 especies. Retira alguna antes de añadir otra.','resource-exhausted');
   const favorite={species_id:id,collection_id:collectionId};if(index<0)data.favorites.push(favorite);else data.favorites[index]=favorite;
  }else if(input.action==='favoriteRemove'){
   const id=validateId(input.species_id);data.favorites=data.favorites.filter(f=>f.species_id!==id);
  }else fail('Operación no reconocida.');
  tx.set(ref,{...data,updated_at:FieldValue.serverTimestamp()});return result;
 });
}
