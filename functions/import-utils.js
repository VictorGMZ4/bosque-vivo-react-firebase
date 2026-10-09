import path from 'node:path';
import {keyFor} from './domain.js';
export function mediaName(original){const extension=path.extname(original).toLowerCase();if(!['.jpg','.jpeg','.png','.webp'].includes(extension))throw Error('Formato de fotografía no compatible');return keyFor(original).slice(0,24)+extension;}
export async function importSpecimen(db,input){
 const id=String(input.id),ref=db.collection('specimens').doc(id),record={...input,species_id:String(input.species_id),latitude:input.latitude==null?null:Number(input.latitude),longitude:input.longitude==null?null:Number(input.longitude),height:input.height==null?null:Number(input.height),observed_on:input.observed_on||''};delete record.id;
 await db.runTransaction(async tx=>{const old=await tx.get(ref);if(old.exists)return;const index=db.collection('specimen_codes').doc(keyFor(record.code));const reserved=await tx.get(index);if(reserved.exists&&reserved.data().id!==id)throw Error('Código de ejemplar ya registrado');tx.set(ref,record);tx.set(index,{id});});
}
