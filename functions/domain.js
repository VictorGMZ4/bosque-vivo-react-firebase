import {createHash} from 'node:crypto';
export class DomainError extends Error {constructor(code,message){super(message);this.code=code;}}
export function fail(message,code='invalid-argument'){throw new DomainError(code,message);}
export function requireAdmin(auth){if(!auth)fail('Inicia sesión para continuar.','unauthenticated');if(auth.token?.admin!==true)fail('Tu cuenta no tiene permiso de administración.','permission-denied');}
export function keyFor(value){return createHash('sha256').update(value.trim().replace(/\s+/g,' ').toLocaleLowerCase('es')).digest('hex');}
function object(value,keys){if(!value||typeof value!=='object'||Array.isArray(value))fail('Datos no válidos.');for(const key of Object.keys(value))if(!keys.includes(key))fail(`Campo no permitido: ${key}.`);}
function text(value,label,max,required=false){if(value==null)value='';if(typeof value!=='string')fail(`${label}: escribe texto.`);value=value.trim();if((required&&!value)||value.length>max)fail(`${label}: ${required?'es obligatorio y ':''}admite hasta ${max} caracteres.`);return value;}
const shortFields={common_name:140,scientific_name:180,family:100,genus:100,order:100,synonyms:240,photo_credit:240,model_credit:240};
const longFields=['description','morphology','ecology','uses','precautions','references'];
export function validateSpecies(value){
 object(value,[...Object.keys(shortFields),...longFields,'habit','is_published','photo','model_3d']);const data={};
 if(value.model_3d!==undefined)data.model_3d=text(value.model_3d,'Modelo 3D',512);
 for(const [name,max]of Object.entries(shortFields))data[name]=text(value[name],name,max,['common_name','scientific_name','family'].includes(name));
 for(const name of longFields)data[name]=text(value[name],name,20000);
 data.habit=value.habit||'tree';if(!['tree','shrub','herb','palm','climber'].includes(data.habit))fail('Selecciona un tipo de planta válido.');
 if(value.is_published!==undefined&&typeof value.is_published!=='boolean')fail('Visibilidad no válida.');
 data.is_published=value.is_published??false;data.photo=text(value.photo,'Fotografía',512);return data;
}
function number(value,label,min,max){if(value==null||value==='')return null;if(!['number','string'].includes(typeof value))fail(`${label}: número no válido.`);const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)fail(`${label}: valor fuera de rango.`);return n;}
export function validateSpecimen(value){
 object(value,['code','zone','latitude','longitude','height','observed_on','notes']);
 const data={code:text(value.code,'Código',40,true),zone:text(value.zone,'Zona',140,true),latitude:number(value.latitude,'Latitud',-90,90),longitude:number(value.longitude,'Longitud',-180,180),height:number(value.height,'Altura',0,9999.99),observed_on:text(value.observed_on,'Fecha',10),notes:text(value.notes,'Observaciones',20000)};
 if((data.latitude===null)!==(data.longitude===null))fail('Completa ambas coordenadas o deja ambas vacías.');
 if(data.observed_on&&(!/^\d{4}-\d{2}-\d{2}$/.test(data.observed_on)||isNaN(Date.parse(data.observed_on))||new Date(data.observed_on).toISOString().slice(0,10)!==data.observed_on))fail('Fecha de observación no válida.');return data;
}
export function validateId(id){if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(id))fail('Identificador no válido.');return id;}
export function validatePath(path,id){if(path&&!new RegExp(`^species/${validateId(id)}/photos/[a-zA-Z0-9_.-]+\\.(jpg|jpeg|png|webp)$`,'i').test(path))fail('La fotografía debe pertenecer a esta especie.');return path;}
export function validatePhoto(value,id){object(value,['caption','credit','path','position']);const data={caption:text(value.caption,'Descripción',240,true),credit:text(value.credit,'Crédito',240),path:text(value.path,'Archivo',512,true),position:Number(value.position??0)};validatePath(data.path,id);if(!Number.isInteger(data.position)||data.position<0||data.position>100000)fail('Orden de fotografía no válido.');return data;}
