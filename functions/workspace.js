import {notify,notificationAction} from './notifications.js';
import {moderationAction} from './moderation.js';
import {historyAction} from './history.js';
import {FieldValue} from 'firebase-admin/firestore';
import {db,authAdmin} from './firebase.js';
import {fail,validateId,validateSpecies,keyFor} from './domain.js';
import {requireRole,roleFor,roles,staff} from './access.js';
import {peopleFor} from './people.js';
const institutional=account=>(account.email||'').toLowerCase().endsWith('@unipaz.edu.co');
function requireInstitutional(account){if(!institutional(account))fail('Para ser profesor o investigador, la cuenta debe usar un correo institucional @unipaz.edu.co.','failed-precondition');if(account.emailVerified!==true)fail('La cuenta debe verificar su correo institucional antes de recibir este rol.','failed-precondition');}
const stamp=()=>FieldValue.serverTimestamp();
function text(value,max,required=false){if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))fail('Revisa los campos obligatorios y su longitud.');return value.trim();}
export async function workspaceAction(auth,input){
 if(!auth)fail('Inicia sesión para continuar.','unauthenticated');
 if(!input||typeof input!=='object')fail('Solicitud inválida.');
 const {action}=input;
 await roleFor(auth);
 if(['submitSpecies','draftSubmission','submitDraft','reviewSpecies'].includes(action))return moderationAction(auth,input);
 if(['notificationsList','notificationRead'].includes(action))return notificationAction(auth,input);
 if(['historyList','trashList','restoreSpecies'].includes(action))return historyAction(auth,input);
 if(action==='submissionAuthors'){
  const role=await requireRole(auth,['admin','teacher','researcher']);if(!Array.isArray(input.ids)||input.ids.length>500)fail('Solicitud inválida.');const ids=[...new Set(input.ids.map(validateId))];
  const owners=ids.length?(await db.getAll(...ids.map(id=>db.collection('submissions').doc(id)))).filter(s=>s.exists&&(role==='admin'||s.data().status!=='draft'||s.data().owner_id===auth.uid)).map(s=>s.data().owner_id):[];const people=await peopleFor(owners);
  return {authors:Object.fromEntries(owners.filter(Boolean).map(uid=>[uid,role==='admin'?people[uid]:{name:people[uid]?.name||'Autor sin nombre en el perfil',email:''}]))};
 }
 if(action==='orphanReport')return (await import('./storage-report.js')).orphanReport(auth);
 if(typeof action==='string'&&action.startsWith('learning'))return (await import('./learning.js')).learningAction(auth,input);
 if(['collectionList','collectionCreate','collectionDelete','favoriteSave','favoriteRemove'].includes(action))return (await import('./collections.js')).collectionsAction(auth,input);
 if(action==='requestTeacher'){
  const account=await authAdmin.getUser(auth.uid),ref=db.collection('role_requests').doc(auth.uid);if(!institutional(account))fail('Para ser profesor o investigador, la cuenta debe usar un correo institucional @unipaz.edu.co.','failed-precondition');
  await db.runTransaction(async tx=>{await requireRole(auth,['student'],tx);const previous=await tx.get(ref);if(previous.data()?.status==='pending')return;tx.set(ref,{owner_id:auth.uid,email:account.email||'',status:'pending',created_at:stamp(),feedback:''});notify(tx,{audience:'admin',title:'Nueva solicitud de profesor o investigador',link:'/usuarios/'});});return {saved:true};
 }
 if(action==='reviewAccount'){
  const uid=validateId(input.uid);if(!['approve','reject'].includes(input.decision))fail('Decisión inválida.');
  const feedback=text(input.feedback||'',1000,input.decision==='reject');await requireRole(auth,['admin']);const account=await authAdmin.getUser(uid);if(input.decision==='approve')requireInstitutional(account);
  await db.runTransaction(async tx=>{await requireRole(auth,['admin'],tx);const ref=db.collection('role_requests').doc(uid),request=await tx.get(ref);const targetRole=await tx.get(db.collection('roles').doc(uid));
   if(request.data()?.status!=='pending')fail('La solicitud ya fue revisada o no existe.','failed-precondition');
   if(input.decision==='approve'){if(targetRole.exists&&targetRole.data().role!=='student')fail('La cuenta ya tiene un rol asignado. Revisa sus permisos.');tx.set(db.collection('roles').doc(uid),{role:'teacher',updated_by:auth.uid,updated_at:stamp()},{merge:true});}
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
  const users=await Promise.all(page.users.map(async u=>{const [role,profile]=await Promise.all([db.collection('roles').doc(u.uid).get(),db.collection('profiles').doc(u.uid).get()]);return {uid:u.uid,email:u.email||'',institutional:institutional(u),email_verified:u.emailVerified===true,name:profile.data()?.name||u.displayName||'',role:role.exists?role.data().role:u.customClaims?.admin?'admin':'student',disabled:role.data()?.disabled===true||u.disabled};}));return {users,cursor:page.pageToken||null};
 }
 if(action==='setRole'){
  const uid=validateId(input.uid);if(!roles.includes(input.role))fail('Rol inválido.');if(uid===auth.uid)fail('No puedes cambiar tu propio rol. Solicita el cambio a otro administrador.');
  await requireRole(auth,['admin']);const account=await authAdmin.getUser(uid);if(staff(input.role))requireInstitutional(account);
  await db.runTransaction(async tx=>{await requireRole(auth,['admin'],tx);tx.set(db.collection('roles').doc(uid),{role:input.role,updated_by:auth.uid,updated_at:stamp()},{merge:true});notify(tx,{owner_id:uid,title:'Tu rol fue actualizado por el administrador.',link:'/perfil/'});});
  return {saved:true};
 }
 if(action==='setAccountStatus'){
  const uid=validateId(input.uid);if(typeof input.disabled!=='boolean')fail('Estado de cuenta inválido.');if(uid===auth.uid)fail('No puedes bloquear tu propia cuenta. Solicita el cambio a otro administrador.');
  const reason=text(input.reason||'',500,input.disabled);await requireRole(auth,['admin']);const account=await authAdmin.getUser(uid);
  await db.runTransaction(async tx=>{await requireRole(auth,['admin'],tx);const ref=db.collection('roles').doc(uid),current=(await tx.get(ref)).data();const role=current?.role||(account.customClaims?.admin?'admin':'student');
   tx.set(ref,{role,disabled:input.disabled,disabled_reason:input.disabled?reason:'',...(input.disabled?{disabled_by:auth.uid,disabled_at:stamp()}:{}),updated_by:auth.uid,updated_at:stamp()},{merge:true});
   tx.create(db.collection('audit').doc(),{entity:'account',entity_id:uid,action:input.disabled?'disable':'enable',actor_id:auth.uid,created_at:stamp(),before:{role,disabled:current?.disabled===true},after:{role,disabled:input.disabled,...(input.disabled?{reason}:{})}});
   if(!input.disabled)notify(tx,{owner_id:uid,title:'Tu cuenta fue desbloqueada por el administrador.',link:'/perfil/'});
  });
  await authAdmin.updateUser(uid,{disabled:input.disabled});if(input.disabled)await authAdmin.revokeRefreshTokens(uid);
  return {saved:true};
 }
 fail('Operación no reconocida.');
}
