import React,{useEffect,useRef,useState} from 'react';
import {getBlob,ref} from 'firebase/storage';
import {storage} from './firebase';

export function ModelViewer({path,name,credit}){
 const [requested,setRequested]=useState(false),[url,setUrl]=useState(''),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const viewer=useRef(null);
 useEffect(()=>{
  if(!requested)return;
  let alive=true,object;
  setError('');setLoaded(false);setUrl('');
  Promise.all([import('@google/model-viewer'),getBlob(ref(storage,path),30*1024*1024)]).then(([,blob])=>{
   if(alive){object=URL.createObjectURL(blob);setUrl(object);}
  }).catch(()=>{if(alive)setError('No pudimos cargar el modelo 3D. Puedes reintentarlo o consultar la fotografía de la ficha.');});
  return()=>{alive=false;if(object)URL.revokeObjectURL(object);};
 },[requested,path,attempt]);
 useEffect(()=>{
  const element=viewer.current;if(!element)return;
  const ready=()=>setLoaded(true),failed=()=>setError('El visor no pudo mostrar el modelo. Reintenta o utiliza un navegador con WebGL disponible.');
  element.addEventListener('load',ready);element.addEventListener('error',failed);
  return()=>{element.removeEventListener('load',ready);element.removeEventListener('error',failed);};
 },[url]);
 const reset=()=>{const element=viewer.current;if(element){element.cameraOrbit='0deg 75deg auto';element.cameraTarget='auto auto auto';element.fieldOfView='auto';element.jumpCameraToGoal();}};
 return <section id="modelo-3d" className="subsection" aria-labelledby="model-title">
  <p className="eyebrow">EXPLORA EN TRES DIMENSIONES</p><h2 id="model-title">{name} en 3D</h2>
  <div className="rounded-2xl border border-botanical-line bg-botanical-surface p-5 sm:p-7">
   <p id="model-help">Arrastra para girar. Usa la rueda del ratón o dos dedos para acercar y alejar. Con el visor enfocado, utiliza las flechas del teclado para girar.</p>
   {!requested&&<div className="flex min-h-64 items-center justify-center rounded-xl bg-[#e9eddf]"><button className="button" onClick={()=>setRequested(true)}>Cargar modelo 3D</button></div>}
   {requested&&!loaded&&!error&&<p role="status">Cargando modelo 3D…</p>}
   {error&&<div className="notice error" role="alert"><p>{error}</p><button className="button outline" onClick={()=>setAttempt(v=>v+1)}>Reintentar modelo</button></div>}
   {url&&!error&&<model-viewer ref={viewer} src={url} alt={`Modelo tridimensional de ${name}. Arrastra para girarlo.`} aria-describedby="model-help" camera-controls="" touch-action="pan-y" camera-orbit="0deg 75deg auto" interaction-prompt="none" loading="eager" shadow-intensity="1" environment-image="neutral" style={{display:'block',width:'100%',height:'clamp(320px,60vh,560px)',background:'#edf1e3',borderRadius:12}}/>}
   {loaded&&!error&&<button className="button outline mt-4" onClick={reset}>Restablecer vista</button>}
   {credit&&<p className="muted mt-4">Crédito del modelo: {credit}</p>}
  </div>
 </section>;
}
