import React,{useEffect,useState} from 'react';
import {getBlob,ref,uploadBytes} from 'firebase/storage';
import {storage} from './firebase';
import {validateModelFile} from './model-file';
export async function uploadModel(file,id){await validateModelFile(file);const path=`species/${id}/models/${crypto.randomUUID()}.glb`;await uploadBytes(ref(storage,path),file,{contentType:'model/gltf-binary'});return path;}
export function StorageImage({path,alt,...props}){const [url,setUrl]=useState('');useEffect(()=>{let alive=true,object;setUrl('');if(path)getBlob(ref(storage,path)).then(blob=>{if(alive){object=URL.createObjectURL(blob);setUrl(object);}}).catch(()=>{});return ()=>{alive=false;if(object)URL.revokeObjectURL(object);};},[path]);return <img src={url||'/botanical.svg'} alt={url?alt:'Ilustración decorativa; fotografía pendiente o no disponible'} {...props}/>;}
export async function uploadPhoto(file,id){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Error('Selecciona JPG, PNG o WebP de hasta 8 MB.');const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];const path=`species/${id}/photos/${crypto.randomUUID()}.${ext}`;await uploadBytes(ref(storage,path),file,{contentType:file.type});return path;}
