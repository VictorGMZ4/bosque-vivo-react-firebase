import {FieldValue,Timestamp} from 'firebase-admin/firestore';
import {db,bucket} from './firebase.js';
import {requireRole} from './access.js';
import {fail,validateId,validateSpecies,keyFor,validateSubmissionModel,validateLocation,mapPoints} from './domain.js';
import {notify} from './notifications.js';
import {checkModel} from './model-assets.js';
const stamp=()=>FieldValue.serverTimestamp(),day=24*60*60*1000;
// Estudiantes: un envío a revisión cada 24 horas. Devuelve la escritura para hacerla tras las lecturas de la transacción.
async function studentQuota(tx,uid,note=''){const ref=db.collection('submission_limits').doc(uid),last=(await tx.get(ref)).data()?.last_sent_at?.toMillis();if(last&&Date.now()-last<day)fail(`Solo puedes enviar una propuesta cada 24 horas. Podrás enviar otra a partir del ${new Date(last+day).toLocaleString('es-CO',{timeZone:'America/Bogota',dateStyle:'long',timeStyle:'short'})}${note}`,'failed-precondition');return ()=>tx.set(ref,{last_sent_at:stamp()});}
function proposalData(input){const data=validateSpecies(input);if(data.is_published||data.photo||data.model_3d)fail('Una propuesta no puede publicar ni enlazar archivos del catálogo.');return data;}
function photosFor(value,id){if(!Array.isArray(value)||value.length>5)fail('Adjunta hasta cinco fotografías.');return value.map(p=>{
 if(!p||typeof p.path!=='string'||!new RegExp(`^submissions/${id}/photos/[a-zA-Z0-9_-]+\\.(jpg|png|webp)$`).test(p.path))fail('Fotografía no válida.');
 if(typeof p.caption!=='string'||!p.caption.trim()||p.caption.length>240||typeof p.credit!=='string'||p.credit.length>240)fail('Añade descripción y revisa el crédito de las fotografías.');const location=validateLocation(p.location);return {path:p.path,caption:p.caption.trim(),credit:p.credit.trim(),...(location?{location}:{})};
 });}
async function checkFiles(photos){for(const photo of photos){let metadata;try{[metadata]=await bucket.file(photo.path).getMetadata();}catch{fail('Una fotografía no terminó de subirse. Vuelve a intentarlo.');}if(Number(metadata.size)>8*1024*1024||!['image/jpeg','image/png','image/webp'].includes(metadata.contentType))fail('La fotografía debe ser JPG, PNG o WebP de hasta 8 MB.');}}
export async function moderationAction(auth,input){
 if(input.action==='draftSubmission'||input.action==='submitSpecies'){
  const data=proposalData(input.data),ref=input.id?db.collection('submissions').doc(validateId(input.id)):db.collection('submissions').doc();
  if(input.action==='submitSpecies'&&input.id)fail('Usa el flujo de reenvío para una propuesta existente.');
  await db.runTransaction(async tx=>{const role=await requireRole(auth,['student','teacher','researcher','admin'],tx);const previous=await tx.get(ref),old=previous.data();
   if(role==='student'&&!input.id&&input.action==='draftSubmission'&&!(await tx.get(db.collection('submissions').where('owner_id','==',auth.uid).where('status','==','draft').limit(1))).empty)fail('Ya tienes un borrador abierto. Envíalo antes de empezar otro.','failed-precondition');
   if(input.id&&(!old||old.owner_id!==auth.uid||!['draft','rejected'].includes(old.status)))fail('Solo puedes corregir tus borradores o propuestas rechazadas.','permission-denied');
   if(old&&(old.revision||1)>=20)fail('Esta propuesta alcanzó el límite de revisiones. Crea una nueva.');
   const pending=input.action==='submitSpecies',quota=pending&&role==='student'?await studentQuota(tx,auth.uid):null;quota?.();tx.set(ref,{...old,data,owner_id:auth.uid,status:pending?'pending':'draft',photos:old?.photos||[],history:old?.history||[],revision:old?.revision||1,created_at:old?.created_at||stamp(),updated_at:stamp(),feedback:old?.feedback||''});
   if(pending)notify(tx,{audience:'reviewers',title:`Nueva propuesta: ${data.common_name}`,link:'/propuestas/'});
  });return {id:ref.id};
 }
 if(input.action==='submitDraft'){
  const ref=db.collection('submissions').doc(validateId(input.id)),photos=photosFor(input.photos||[],ref.id),model=validateSubmissionModel(input.model,ref.id),role=await requireRole(auth,['student','teacher','researcher','admin']);if(role==='student'&&model)fail('Los modelos 3D solo pueden aportarlos profesores o administradores.','permission-denied');await checkFiles(photos);if(model)await checkModel(model.path);
  await db.runTransaction(async tx=>{const current=await requireRole(auth,['student','teacher','researcher','admin'],tx);const s=await tx.get(ref),old=s.data();if(!old||old.owner_id!==auth.uid||old.status!=='draft')fail('La propuesta no está disponible para enviar.','permission-denied');
   if(current==='student'&&model)fail('Los modelos 3D solo pueden aportarlos profesores o administradores.','permission-denied');const quota=current==='student'&&!(old.history||[]).length?await studentQuota(tx,auth.uid,'; tu borrador queda guardado en Mis propuestas.'):null;quota?.();
   tx.update(ref,{status:'pending',photos,model,feedback:'',revision:(old.revision||0)+1,updated_at:stamp()});notify(tx,{audience:'reviewers',title:`Propuesta para revisar: ${old.data.common_name}`,link:'/propuestas/'});
  });return {id:ref.id};
 }
 if(input.action==='reviewSpecies'){
  await requireRole(auth,['admin','teacher','researcher']);const id=validateId(input.id),ref=db.collection('submissions').doc(id),species=db.collection('species').doc(id),snapshot=await ref.get(),old=snapshot.data();
  if(old?.owner_id===auth.uid)fail('No puedes revisar tu propia propuesta.','permission-denied');
  if(!['approve','reject'].includes(input.decision))fail('Decisión inválida.');const feedback=input.feedback||'';if(typeof feedback!=='string'||feedback.length>1000||(input.decision==='reject'&&!feedback.trim()))fail('El rechazo requiere observaciones (máximo 1000 caracteres).');
  if(!old||old.status!=='pending')fail('La propuesta ya fue revisada o no existe.','failed-precondition');
  const data=proposalData(old.data),photos=photosFor(old.photos||[],id),model=validateSubmissionModel(old.model,id),destinations=[];let publishedModel={model_3d:'',model_hotspots:[]};
  if(input.decision==='approve'){if(model){await checkModel(model.path);const path=`species/${id}/models/${model.path.split('/').pop()}`;await bucket.file(model.path).copy(bucket.file(path));publishedModel={model_3d:path,model_credit:model.credit,model_hotspots:model.hotspots};}await checkFiles(photos);for(const photo of photos){const path=`species/${id}/photos/${photo.path.split('/').pop()}`;await bucket.file(photo.path).copy(bucket.file(path));destinations.push({...photo,path});}}
  await db.runTransaction(async tx=>{await requireRole(auth,['admin','teacher','researcher'],tx);const current=await tx.get(ref),record=current.data();if(!record||record.status!=='pending'||record.revision!==old.revision)fail('La propuesta cambió; vuelve a cargarla.','failed-precondition');
   if(input.decision==='approve'){
    const unique=db.collection('scientific_names').doc(keyFor(data.scientific_name));if((await tx.get(unique)).exists)fail('Ya existe una especie con ese nombre científico.','already-exists');
    const cover={photo:destinations[0]?.path||'',photo_credit:destinations[0]?.credit||'',photo_location:destinations[0]?.location||null};
    tx.create(species,{...data,...publishedModel,...cover,map_points:mapPoints({...data,...cover},destinations.map((p,index)=>({...p,id:`${id}_${index}`})),[]),is_published:true,is_demo:false,specimen_count:0,submitted_by:record.owner_id,approved_by:auth.uid,created_at:stamp(),updated_at:stamp()});tx.create(unique,{id});
    destinations.forEach((p,index)=>tx.create(db.collection('photos').doc(`${id}_${index}`),{...p,species_id:id,position:index,created_at:stamp(),updated_at:stamp()}));
    tx.create(db.collection('audit').doc(),{entity:'species',entity_id:id,action:'approve',actor_id:auth.uid,created_at:stamp(),after:{...data,...publishedModel,photo:destinations[0]?.path||'',photo_credit:destinations[0]?.credit||'',is_published:true}});
   }
   const status=input.decision==='approve'?'approved':'rejected';tx.update(ref,{status,feedback:feedback.trim(),reviewed_by:auth.uid,reviewed_at:stamp(),history:[...(record.history||[]),{revision:record.revision||1,status,feedback:feedback.trim(),reviewed_by:auth.uid,at:Timestamp.now()}],...(status==='approved'?{species_id:id}:{})});
   notify(tx,{owner_id:record.owner_id,title:`Tu propuesta ${data.common_name} fue ${status==='approved'?'aprobada':'rechazada'}.`,link:'/propuestas/'});
  });return {id};
 }
 fail('Acción de propuesta inválida.');
}
