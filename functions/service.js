import {FieldValue} from 'firebase-admin/firestore';
import {db} from './firebase.js';
import {requireRole,owns,staff} from './access.js';
import {fail,keyFor,specimenCode,validateSpecies,validateSpecimen,validatePhoto,validateId,validatePath,mapPoints} from './domain.js';
import {checkModel} from './model-assets.js';
const collections={species:'species',specimen:'specimens',photo:'photos'};
export async function mutateData(auth,input){
 await requireRole(auth,['admin','teacher','researcher']);
 if(!input||!collections[input.entity]||!['create','update','delete'].includes(input.action))fail('Operación no válida.');
 const {entity,action}=input,creating=action==='create',deleting=action==='delete';
 const ref=creating?db.collection(collections[entity]).doc():db.collection(collections[entity]).doc(validateId(input.id));
 const id=ref.id;
 const data=deleting?null:entity==='species'?validateSpecies(input.data):entity==='specimen'?validateSpecimen(input.data,!creating):null;
 const autoCode=entity==='specimen'&&creating&&!data.code;
 if(entity==='species'&&data)validatePath(data.photo,id);
 if(data?.model_3d&&!new RegExp(`^species/${id}/models/[a-zA-Z0-9_-]+\\.glb$`).test(data.model_3d))fail('El modelo debe pertenecer a esta especie.');
 if(data?.model_3d)await checkModel(data.model_3d);
 await db.runTransaction(async tx=>{
  const role=await requireRole(auth,['admin','teacher','researcher'],tx);
  const snapshot=await tx.get(ref),old=snapshot.data();
  if(entity==='species'&&data&&data.model_3d!==undefined&&data.model_3d!==(old?.model_3d||'')&&data.model_hotspots===undefined)data.model_hotspots=[];
  if(!creating&&!snapshot.exists)fail('El registro ya no existe.','not-found');
  const parentId=entity==='species'?id:creating?validateId(input.species_id):old.species_id;
  const parentRef=db.collection('species').doc(parentId);
  const parent=entity==='species'?snapshot:await tx.get(parentRef);
  if(entity!=='species'&&!parent.exists)fail('La especie ya no existe.','not-found');
  if(staff(role)&&(deleting||!(entity==='species'&&creating)&&!owns(parent.data(),auth.uid)))fail('Solo puedes editar las especies que registraste. Retirar registros corresponde a la administración.','permission-denied');
  if(entity==='photo'&&!deleting)Object.assign(input,{data:validatePhoto(input.data,parentId)});
  if(entity==='specimen'&&!deleting){
   validatePath(data.photo,parentId);
   if(autoCode){data.code='';for(let attempt=0,n=(parent.data().specimen_count||0)+1;attempt<50;attempt++,n++){const code=specimenCode(parent.data().common_name,n);if(!(await tx.get(db.collection('specimen_codes').doc(keyFor(code)))).exists){data.code=code;break;}}if(!data.code)fail('No se pudo asignar un código único al ejemplar. Vuelve a intentarlo o contacta con la administración.','failed-precondition');}
  }
  const uniqueField=entity==='species'?'scientific_name':entity==='specimen'?'code':null;
  const registry=entity==='species'?'scientific_names':'specimen_codes';
  const uniqueRef=uniqueField&&!deleting?db.collection(registry).doc(keyFor(data[uniqueField])):null;
  if(uniqueRef){const unique=await tx.get(uniqueRef);if(unique.exists&&unique.data().id!==id)fail('Ese nombre científico o código ya está registrado.','already-exists');}
  let photos;
  if(entity==='species'&&deleting){
   const specimens=await tx.get(db.collection('specimens').where('species_id','==',id).limit(1));
   if(!specimens.empty)fail('Primero elimina los ejemplares asociados a esta especie.','failed-precondition');
   photos=await tx.get(db.collection('photos').where('species_id','==',id));
   if(photos.size>400)fail('La galería requiere una eliminación por lotes.','failed-precondition');
  }
  let points;
  if(!(entity==='species'&&deleting)){
   const current={...old,...(deleting?{}:entity==='photo'?input.data:data)},siblings=entity==='species'&&creating?[null,null]:await Promise.all(['photos','specimens'].map(name=>tx.get(db.collection(name).where('species_id','==',parentId))));
   const rows=(found,name)=>{const map=new Map((found?.docs||[]).map(d=>[d.id,d.data()]));if(collections[entity]===name){if(deleting)map.delete(id);else map.set(id,current);}return [...map].map(([key,row])=>({id:key,...row}));};
   points=mapPoints(entity==='species'?current:parent.data(),rows(siblings[0],'photos'),rows(siblings[1],'specimens'));
  }
  if(uniqueField&&old&&(deleting||keyFor(old[uniqueField])!==keyFor(data[uniqueField])))tx.delete(db.collection(registry).doc(keyFor(old[uniqueField])));
  if(deleting){
   if(entity==='species')tx.set(db.collection('trash').doc(id),{record:old,photos:photos.docs.map(p=>({id:p.id,data:p.data()})),actor_id:auth.uid,deleted_at:FieldValue.serverTimestamp()});
   if(photos)for(const photo of photos.docs)tx.delete(photo.ref);
   tx.delete(ref);
   if(entity==='specimen')tx.update(parentRef,{specimen_count:Math.max(0,(parent.data().specimen_count||0)-1),updated_at:FieldValue.serverTimestamp()});
  }else{
   if(uniqueRef)tx.set(uniqueRef,{id});
   const record=entity==='photo'?input.data:data;
   tx.set(ref,{...old,...record,...(entity!=='species'?{species_id:parentId}:creating?{is_demo:false,specimen_count:0,created_by:auth.uid}:{}),updated_at:FieldValue.serverTimestamp(),...(creating?{created_at:FieldValue.serverTimestamp()}: {})});
   if(entity==='specimen'&&creating)tx.update(parentRef,{specimen_count:(parent.data().specimen_count||0)+1,updated_at:FieldValue.serverTimestamp()});
  }
  if(points)tx.update(entity==='species'?ref:parentRef,{map_points:points});
  tx.create(db.collection('audit').doc(),{entity,entity_id:id,action,actor_id:auth.uid,created_at:FieldValue.serverTimestamp(),...(old?{before:old}:{}),...(!deleting?{after:entity==='photo'?input.data:data}:{})});
 });
 return {id};
}
