import {FieldValue} from 'firebase-admin/firestore';
import {db} from './firebase.js';
import {requireRole} from './access.js';
import {fail,validateId,keyFor} from './domain.js';
export async function historyAction(auth,input){
 await requireRole(auth,['admin']);
 if(input.action==='historyList'){const q=input.id?db.collection('audit').where('entity_id','==',validateId(input.id)):db.collection('audit');const snapshot=await q.orderBy('created_at','desc').limit(100).get();return {items:snapshot.docs.map(d=>({id:d.id,...d.data(),created_at:d.data().created_at?.toMillis()||0}))};}
 if(input.action==='trashList'){const snapshot=await db.collection('trash').orderBy('deleted_at','desc').limit(100).get();return {items:snapshot.docs.map(d=>({id:d.id,name:d.data().record.common_name,deleted_at:d.data().deleted_at?.toMillis()||0,actor_id:d.data().actor_id}))};}
 if(input.action==='restoreSpecies'){
  const id=validateId(input.id),trash=db.collection('trash').doc(id),species=db.collection('species').doc(id);
  await db.runTransaction(async tx=>{await requireRole(auth,['admin'],tx);const archived=await tx.get(trash),current=await tx.get(species);if(!archived.exists||current.exists)fail('La especie no está disponible para restaurar.','failed-precondition');
   const {record,photos}=archived.data(),unique=db.collection('scientific_names').doc(keyFor(record.scientific_name));if((await tx.get(unique)).exists)fail('Ya existe una especie con ese nombre científico. Resuelve el duplicado antes de restaurar.','already-exists');
   tx.create(species,{...record,is_published:false,updated_at:FieldValue.serverTimestamp()});tx.create(unique,{id});for(const p of photos||[])tx.set(db.collection('photos').doc(p.id),p.data);tx.delete(trash);
   tx.create(db.collection('audit').doc(),{entity:'species',entity_id:id,action:'restore',actor_id:auth.uid,created_at:FieldValue.serverTimestamp(),after:{...record,is_published:false}});
  });return {id};
 }
 fail('Acción no válida.');
}
