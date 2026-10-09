import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {db,bucket} from '../firebase.js';
if(process.env.GCLOUD_PROJECT!=='demo-bosque-vivo'||process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080'||process.env.FIREBASE_STORAGE_EMULATOR_HOST!=='127.0.0.1:9199')throw Error('Solo se permite importar modelos a emuladores locales.');
const root=fileURLToPath(new URL('../../',import.meta.url));
const input=JSON.parse(await readFile(path.join(root,'work/import/data.json'),'utf8'));
for(const plant of input.species){
 if(!plant.model_3d)continue;
 const base=path.resolve(root,'work/import/media'),file=path.resolve(base,plant.model_3d);
 if(!file.startsWith(base+path.sep)||path.extname(file).toLowerCase()!=='.glb')throw Error('Ruta de modelo inválida.');
 const species=db.collection('species').doc(String(plant.id)),record=await species.get();
 if(!record.exists||record.data().model_3d)continue;
 const bytes=await readFile(file);
 if(bytes.length<20||bytes.length>30*1024*1024||bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('GLB inválido o demasiado grande.');
 const model=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
 if([...(model.buffers||[]),...(model.images||[])].some(item=>item.uri&&!item.uri.startsWith('data:')))throw Error('Se requiere un GLB autocontenido.');
 const storagePath=`species/${plant.id}/models/original.glb`;
 await bucket.file(storagePath).save(bytes,{metadata:{contentType:'model/gltf-binary'}});
 await species.update({model_3d:storagePath,model_credit:record.data().model_credit||plant.model_credit||''});
 console.log(`Modelo incorporado a especie ${plant.id}: ${bytes.length} bytes.`);
}
