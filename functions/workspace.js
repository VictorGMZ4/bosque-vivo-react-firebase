import {notify,notificationAction} from './notifications.js';
import {moderationAction} from './moderation.js';
import {historyAction} from './history.js';
import {FieldValue} from 'firebase-admin/firestore';
import {db,authAdmin} from './firebase.js';
import {fail,validateId,validateSpecies,keyFor} from './domain.js';
import {requireRole,roles} from './access.js';
const stamp=()=>FieldValue.serverTimestamp();
function text(value,max,required=false){if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))fail('Revisa los campos obligatorios y su longitud.');return value.trim();}
export async function workspaceAction(auth,input){
 if(!auth)fail('Inicia sesión para continuar.','unauthenticated');
 if(!input||typeof input!=='object')fail('Solicitud inválida.');
 const {action}=input;
 if(['submitSpecies','draftSubmission','submitDraft','reviewSpecies'].includes(action))return moderationAction(auth,input);
 if(['notificationsList','notificationRead'].includes(action))return notificationAction(auth,input);
 if(['historyList','trashList','restoreSpecies'].includes(action))return historyAction(auth,input);
 if(typeof action==='string'&&action.startsWith('learning'))return (await import('./learning.js')).learningAction(auth,input);
 if(['collectionList','collectionCreate','collectionDelete','favoriteSave','favoriteRemove'].includes(action))return (await import('./collections.js')).collectionsAction(auth,input);
 if(action==='requestTeacher'){
  const account=await authAdmin.getUser(auth.uid),ref=db.collection('role_requests').doc(auth.uid);
  await db.runTransaction(async tx=>{await requireRole(auth,['student'],tx);const previous=await tx.get(ref);if(previous.data()?.status==='pending')return;tx.set(ref,{owner_id:auth.uid,email:account.email||'',status:'pending',created_at:stamp(),feedback:''});notify(tx,{audience:'admin',title:'Nueva solicitud de profesor o investigador',link:'/usuarios/'});});return {saved:true};
 }
 if(action==='reviewAccount'){
  const uid=validateId(input.uid);if(!['approve','reject'].includes(input.decision))fail('Decisión inválida.');
  const feedback=text(input.feedback||'',1000,input.decision==='reject');await authAdmin.getUser(uid);
  await db.runTransaction(async tx=>{await requireRole(auth,['admin'],tx);const ref=db.collection('role_requests').doc(uid),request=await tx.get(ref);const targetRole=await tx.get(db.collection('roles').doc(uid));
   if(request.data()?.status!=='pending')fail('La solicitud ya fue revisada o no existe.','failed-precondition');
   if(input.decision==='approve'){if(targetRole.exists&&targetRole.data().role!=='student')fail('La cuenta ya tiene un rol asignado. Revisa sus permisos.');tx.set(db.collection('roles').doc(uid),{role:'teacher',updated_by:auth.uid,updated_at:stamp()});}
   tx.update(ref,{status:input.decision==='approve'?'approved':'rejected',feedback,reviewed_by:auth.uid,reviewed_at:stamp()});notify(tx,{owner_id:uid,title:input.decision==='approve'?'Tu solicitud de profesor fue aprobada.':'Tu solicitud de profesor fue rechazada. Revisa las observaciones.',link:'/perfil/'});
  });return {saved:true};
 }
 if(action==='saveProfile'){
  const p=input.data||{};if(Object.keys(p).some(k=>!['name','institution','bio'].includes(k)))fail('Campo de perfil no permitido.');
  const data={name:text(p.name,100,true),institution:text(p.institution||'',160),bio:text(p.bio||'',1000),updated_at:stamp()};
  await db.collection('profiles').doc(auth.uid).set(data);return {saved:true};
 }
 if(action==='listUsers'){
  await requireRole(auth,['admin']);const page=await authAdmin.listUsers(50,input.cursor||undefined);
  const users=await Promise.all(page.users.map(async u=>{const [role,profile]=await Promise.all([db.collection('roles').doc(u.uid).get(),db.collection('profiles').doc(u.uid).get()]);return {uid:u.uid,email:u.email||'',name:profile.data()?.name||u.displayName||'',role:role.exists?role.data().role:u.customClaims?.admin?'admin':'student'};}));return {users,cursor:page.pageToken||null};
 }
 if(action==='setRole'){
  const uid=validateId(input.uid);if(!roles.includes(input.role))fail('Rol inválido.');if(uid===auth.uid)fail('No puedes cambiar tu propio rol. Solicita el cambio a otro administrador.');
  await requireRole(auth,['admin']);await authAdmin.getUser(uid);
  await db.runTransaction(async tx=>{await requireRole(auth,['admin'],tx);tx.set(db.collection('roles').doc(uid),{role:input.role,updated_by:auth.uid,updated_at:stamp()});notify(tx,{owner_id:uid,title:'Tu rol fue actualizado por el administrador.',link:'/perfil/'});});
  return {saved:true};
 }
 fail('Operación no reconocida.');
}
