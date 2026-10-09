import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {Timestamp} from 'firebase-admin/firestore';
import {db,authAdmin,bucket} from '../firebase.js';
import {keyFor} from '../domain.js';
import {mediaName,importSpecimen} from '../import-utils.js';
if(process.env.GCLOUD_PROJECT!=='demo-bosque-vivo'||process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080'||process.env.FIREBASE_AUTH_EMULATOR_HOST!=='127.0.0.1:9099'||process.env.FIREBASE_STORAGE_EMULATOR_HOST!=='127.0.0.1:9199')throw Error('Importación permitida únicamente en emuladores locales demo-bosque-vivo.');
const root=fileURLToPath(new URL('../../',import.meta.url)),input=JSON.parse(await readFile(path.join(root,'work/import/data.json'),'utf8'));
for(const plant of input.species){
 const id=String(plant.id),ref=db.collection('species').doc(id);
 if((await ref.get()).exists)continue; // repeat imports never overwrite edits
 const originalPhoto=plant.photo; const record={...plant,id:undefined,is_published:!!plant.is_published,is_demo:!!plant.is_demo,specimen_count:input.specimens.filter(s=>s.species_id===plant.id).length,updated_at:Timestamp.fromDate(new Date(plant.updated_at)),photo:'',legacy_photo:originalPhoto,legacy_model_3d:plant.model_3d};
 delete record.id;delete record.model_3d;
 if(originalPhoto){const storagePath=`species/${id}/photos/original-${mediaName(originalPhoto)}`;const file=path.join(root,'work/import/media',originalPhoto);const ext=path.extname(file).toLowerCase();await bucket.file(storagePath).save(await readFile(file),{metadata:{contentType:ext==='.webp'?'image/webp':ext==='.png'?'image/png':'image/jpeg'}});record.photo=storagePath;}
 await db.runTransaction(async tx=>{const unique=db.collection('scientific_names').doc(keyFor(record.scientific_name));const current=await tx.get(unique);if(current.exists&&current.data().id!==id)throw Error('Nombre científico duplicado en importación');tx.set(ref,record);tx.set(unique,{id});});
}
for(const specimen of input.specimens)await importSpecimen(db,specimen);
for(const photo of input.photos){const id=String(photo.id),ref=db.collection('photos').doc(id);if((await ref.get()).exists)continue;const storagePath=`species/${photo.species_id}/photos/gallery-${id}-${mediaName(photo.image)}`;const file=path.join(root,'work/import/media',photo.image);const ext=path.extname(file).toLowerCase();await bucket.file(storagePath).save(await readFile(file),{metadata:{contentType:ext==='.webp'?'image/webp':ext==='.png'?'image/png':'image/jpeg'}});await ref.set({species_id:String(photo.species_id),path:storagePath,caption:photo.caption,credit:photo.credit,position:photo.position});}
const access=path.join(root,'work/local-access.json');let credentials;try{credentials=JSON.parse(await readFile(access,'utf8'));}catch{credentials={email:'administracion@flora-viva.test',password:randomBytes(18).toString('base64url')};}
let user;try{user=await authAdmin.getUserByEmail(credentials.email);}catch{user=await authAdmin.createUser(credentials);}
await authAdmin.setCustomUserClaims(user.uid,{admin:true});await mkdir(path.dirname(access),{recursive:true});await writeFile(access,JSON.stringify(credentials,null,2));
console.log(JSON.stringify({species:input.species.length,specimens:input.specimens.length,photos:input.photos.length,localAdminCreated:true,credentialsFile:'work/local-access.json',productionAccess:false}));
