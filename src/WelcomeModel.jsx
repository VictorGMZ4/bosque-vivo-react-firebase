import React,{useEffect,useRef,useState} from 'react';

export function WelcomeModel(){
 const container=useRef(null),viewer=useRef(null);
 const [requested,setRequested]=useState(false),[engine,setEngine]=useState(false),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[rotating,setRotating]=useState(false),[visible,setVisible]=useState(true);
 useEffect(()=>{
  const element=container.current,observer=new IntersectionObserver(([entry])=>{setVisible(entry.isIntersecting);if(entry.isIntersecting&&!navigator.connection?.saveData)setRequested(true);});
  observer.observe(element);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{if(!requested)return;let alive=true;setError('');import('@google/model-viewer').then(()=>{if(alive)setEngine(true);}).catch(()=>{if(alive)setError('No se pudo iniciar el visor. Puedes continuar explorando la colección.');});return()=>{alive=false;};},[requested,attempt]);
 useEffect(()=>{
  const element=viewer.current;if(!element)return;
  const ready=()=>{
   // Blender's procedural leaf shader loses its base color in the original GLB.
   // Restore the base green from plant-source/refine_render.py without editing the asset.
   element.model?.materials.find(material=>material.name==='Leaf - living green')?.pbrMetallicRoughness.setBaseColorFactor([.02,.14,.015,1]);
   setLoaded(true);setError('');
  },failed=()=>setError('No se pudo mostrar la planta 3D. Puedes reintentar o seguir explorando.');
  element.addEventListener('load',ready);element.addEventListener('error',failed);if(element.loaded)ready();
  return()=>{element.removeEventListener('load',ready);element.removeEventListener('error',failed);};
 },[engine,attempt]);
 useEffect(()=>{
  const element=viewer.current;if(!element)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{element.autoRotate=rotating&&visible&&!document.hidden&&!motion.matches;};update();
  document.addEventListener('visibilitychange',update);motion.addEventListener('change',update);
  return()=>{document.removeEventListener('visibilitychange',update);motion.removeEventListener('change',update);element.autoRotate=false;};
 },[engine,attempt,rotating,visible]);
 const retry=()=>{setError('');setLoaded(false);setRequested(true);setAttempt(n=>n+1);};
 return <div className="welcome-model" ref={container} aria-label="Planta de bienvenida en 3D"><span className="welcome-model-tag">UNA NUEVA FORMA DE OBSERVAR</span>
  <div className="welcome-model-stage">
   {(!engine||!loaded||error)&&<img className="welcome-poster" src="/models/welcome-poster.jpg" alt="Planta ilustrativa creada para Bosque Vivo"/>}
   {engine&&!error&&<model-viewer key={attempt} ref={viewer} src={attempt?`/models/welcome-plant.glb?retry=${attempt}`:"/models/welcome-plant.glb"} alt="Planta ilustrativa de bienvenida. Arrastra o usa las flechas del teclado para girar." camera-controls="" touch-action="pan-y" camera-orbit="0deg 78deg auto" shadow-intensity="1" environment-image="neutral" exposure="1.1" interaction-prompt="none" loading="eager" style={{opacity:loaded?1:0}}/>}
   {requested&&!loaded&&!error&&<p className="welcome-loading" role="status">Preparando la planta 3D…</p>}
   {!requested&&<button className="button welcome-load" onClick={()=>setRequested(true)}>Explorar planta 3D</button>}
  </div>
  {error?<div className="welcome-feedback" role="alert"><p>{error}</p><button className="button outline small" onClick={retry}>Reintentar bienvenida 3D</button></div>:<div className="welcome-controls"><p>{loaded?'Arrastra para girar · Acerca para descubrir':'Una planta, muchas perspectivas.'}</p>{loaded&&<button className="button outline small" aria-pressed={rotating} onClick={()=>setRotating(!rotating)}>{rotating?'Pausar giro':'Girar automáticamente'}</button>}</div>}
  <p className="welcome-credit">Modelo original creado para Bosque Vivo. Ilustración, no identificación botánica.</p>
 </div>;
}
