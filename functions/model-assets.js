import {bucket} from './firebase.js';
import {fail} from './domain.js';
export async function checkModel(path){
 if(!path)return;
 let meta;try{[meta]=await bucket.file(path).getMetadata();}catch{fail('El modelo no terminó de subirse. Vuelve a intentarlo.');}
 if(Number(meta.size)>30*1024*1024||Number(meta.size)<20||meta.contentType!=='model/gltf-binary')fail('El modelo debe ser GLB de hasta 30 MB.');
 const [bytes]=await bucket.file(path).download();
 if(bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length||bytes.readUInt32LE(16)!==0x4e4f534a||20+bytes.readUInt32LE(12)>bytes.length)fail('Modelo GLB no válido.');
 let json;try{json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());}catch{fail('Contenido GLB no válido.');}
 if([...(json.buffers||[]),...(json.images||[])].some(x=>x.uri&&!x.uri.startsWith('data:')))fail('El modelo debe incluir sus recursos, sin enlaces externos.');
}
