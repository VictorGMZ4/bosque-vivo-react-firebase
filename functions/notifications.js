import {FieldValue} from 'firebase-admin/firestore';
import {db} from './firebase.js';
import {fail,validateId} from './domain.js';
import {roleFor} from './access.js';
export function notify(tx,{owner_id='',audience='user',title,link}){tx.create(db.collection('notifications').doc(),{owner_id,audience,title,link,created_at:FieldValue.serverTimestamp()});}
export async function notificationAction(auth,input){
 if(!auth)fail('Inicia sesión.','unauthenticated');
 const role=await roleFor(auth);
 if(input.action==='notificationsList'){
  const own=await db.collection('notifications').where('owner_id','==',auth.uid).orderBy('created_at','desc').limit(100).get();
  const shared=role==='admin'?await db.collection('notifications').where('audience','==','admin').orderBy('created_at','desc').limit(100).get():null;
  const docs=[...own.docs,...(shared?.docs||[])];const reads=docs.length?await db.getAll(...docs.map(d=>db.collection('notification_reads').doc(auth.uid).collection('items').doc(d.id))):[];
  return {items:docs.map((d,i)=>({id:d.id,...d.data(),created_at:d.data().created_at?.toMillis()||0,read:reads[i].exists})).sort((a,b)=>b.created_at-a.created_at)};
 }
 if(input.action==='notificationRead'){
  const id=validateId(input.id),doc=await db.collection('notifications').doc(id).get();if(!doc.exists||(doc.data().owner_id!==auth.uid&&!(role==='admin'&&doc.data().audience==='admin')))fail('Notificación no disponible.','permission-denied');
  await db.collection('notification_reads').doc(auth.uid).collection('items').doc(id).set({read_at:FieldValue.serverTimestamp()});return {saved:true};
 }
 fail('Acción no válida.');
}
