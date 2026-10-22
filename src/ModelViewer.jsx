import React,{useEffect,useId,useRef,useState} from 'react';
import {getBlob,ref} from 'firebase/storage';
import {storage} from './firebase';
import './model-hotspots.css';
import {HotspotCallout} from './HotspotCallout';

export function ModelViewer({path,file,name,credit,hotspots=[],onHotspotsChange,disabled=false,autoLoad=false,compact=false}){
 const editable=typeof onHotspotsChange==='function',uid=useId(),viewer=useRef(null),start=useRef(null);
 const [requested,setRequested]=useState(editable||autoLoad),[url,setUrl]=useState(''),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[selected,setSelected]=useState(null),[placing,setPlacing]=useState(null),[notice,setNotice]=useState('');
 const active=hotspots.find(p=>p.id===selected);
 useEffect(()=>{setSelected(null);setPlacing(null);setNotice('');},[path,file]);
 useEffect(()=>{
  if(!requested)return;let alive=true,object;setError('');setLoaded(false);setUrl('');
  Promise.all([import('@google/model-viewer'),file?Promise.resolve(file):getBlob(ref(storage,path),30*1024*1024)]).then(([,blob])=>{if(alive){object=URL.createObjectURL(blob);setUrl(object);}}).catch(()=>{if(alive)setError('No pudimos cargar el modelo 3D. Reintenta o consulta la fotografía de la ficha.');});
  return()=>{alive=false;if(object)URL.revokeObjectURL(object);};
 },[requested,path,file,attempt]);
 useEffect(()=>{const element=viewer.current;if(!element)return;const ready=()=>setLoaded(true),failed=()=>setError('El visor no pudo mostrar el modelo. Reintenta con un GLB válido y un navegador con WebGL.');element.addEventListener('load',ready);element.addEventListener('error',failed);return()=>{element.removeEventListener('load',ready);element.removeEventListener('error',failed);};},[url]);
 // model-viewer observes slot changes but moved points also need an explicit update.
 useEffect(()=>{if(!loaded)return;for(const p of hotspots)viewer.current?.updateHotspot({name:`hotspot-${p.id}`,position:p.position.map(n=>`${n}m`).join(' '),normal:p.normal.join(' ')});},[hotspots,loaded]);
 function pick(event){
  if(!editable||disabled||!placing||!loaded||event.target.closest('button'))return;
  const down=start.current;start.current=null;if(!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>6)return;
  const hit=viewer.current.positionAndNormalFromPoint(event.clientX,event.clientY);
  if(!hit){setNotice('Selecciona una parte de la superficie de la planta, no el fondo.');return;}
  const position=[hit.position.x,hit.position.y,hit.position.z],normal=[hit.normal.x,hit.normal.y,hit.normal.z];
  const length=Math.hypot(...normal);if(!length)return;const orientation=normal.map(n=>n/length);
  const id=placing==='new'?crypto.randomUUID():placing;
  onHotspotsChange(placing==='new'?[...hotspots,{id,title:'',description:'',position,normal:orientation}]:hotspots.map(p=>p.id===id?{...p,position,normal:orientation}:p));
  setSelected(id);setPlacing(null);setNotice('Punto colocado. Completa su título y descripción; se guardará con la ficha.');
 }
 function closeCallout(){setSelected(null);const marker=Array.from(viewer.current?.querySelectorAll('.model-hotspot')||[]).find(el=>el.getAttribute('slot')===`hotspot-${selected}`);marker?.focus();}
 function edit(field,value){onHotspotsChange(hotspots.map(p=>p.id===selected?{...p,[field]:value}:p));}
 const reset=()=>{const e=viewer.current;if(e){e.cameraOrbit='0deg 75deg auto';e.cameraTarget='auto auto auto';e.fieldOfView='auto';e.jumpCameraToGoal();}};
 return <section id={editable?undefined:'modelo-3d'} className="subsection model-section" aria-labelledby={`${uid}-title`}>
 <p className="eyebrow">{editable?'EDITOR DE PUNTOS INFORMATIVOS':'EXPLORA EN TRES DIMENSIONES'}</p><h2 id={`${uid}-title`}>{name||'Planta'} en 3D</h2>
 <div className="model-panel"><p id={`${uid}-help`} className={compact?'model-help-hidden':undefined}>Arrastra para girar. Usa la rueda o dos dedos para acercar. Con el visor enfocado, utiliza las flechas para girar.</p>
 {editable&&<div className="actions"><button type="button" className="button" disabled={!loaded||disabled||hotspots.length>=30} aria-pressed={placing==='new'} onClick={()=>{setPlacing('new');setNotice('Pulsa sobre la parte del modelo donde deseas colocar el punto.');}}>Añadir punto informativo</button>{placing&&<button type="button" className="button outline" onClick={()=>{setPlacing(null);setNotice('Colocación cancelada.');}}>Cancelar colocación</button>}<span>{hotspots.length}/30 puntos</span></div>}
 <p role="status" className="model-status">{notice}</p>
 {!requested&&<button type="button" className="button" onClick={()=>setRequested(true)}>Cargar modelo 3D</button>}
 {requested&&!loaded&&!error&&<p role="status">Cargando modelo 3D…</p>}
 {error&&<div className="notice error" role="alert"><p>{error}</p><button type="button" className="button outline" onClick={()=>setAttempt(v=>v+1)}>Reintentar modelo</button></div>}
 {url&&!error&&<div className="model-stage"><model-viewer ref={viewer} src={url} alt={`Modelo tridimensional de ${name||'la planta'}`} aria-describedby={`${uid}-help`} camera-controls="" touch-action="pan-y" camera-orbit="0deg 75deg auto" interaction-prompt="none" loading="eager" shadow-intensity="1" environment-image="neutral" className={placing?'is-placing':''} onPointerDown={e=>{start.current={x:e.clientX,y:e.clientY};}} onPointerCancel={()=>{start.current=null;}} onPointerUp={pick}>
 {hotspots.map((p,i)=><button key={p.id} type="button" className="model-hotspot" slot={`hotspot-${p.id}`} data-position={p.position.map(n=>`${n}m`).join(' ')} data-normal={p.normal.join(' ')} data-visibility-attribute="visible" aria-label={`Punto ${i+1}: ${p.title||'Sin título'}`} aria-pressed={selected===p.id} onClick={e=>{e.stopPropagation();setSelected(p.id);setPlacing(null);}}><span aria-hidden="true"/></button>)}
 </model-viewer>{active&&loaded&&!placing&&<HotspotCallout viewer={viewer} point={active} onClose={closeCallout}/>}</div>}
 {loaded&&!error&&<button type="button" className="button outline mt-4" onClick={reset}>Restablecer vista</button>}
 {hotspots.length>0&&(!compact||editable)&&<div className="model-points"><h3>Puntos informativos</h3><div className="model-point-list">{hotspots.map((p,i)=><button key={p.id} type="button" className="button outline small" aria-pressed={selected===p.id} onClick={()=>{setSelected(p.id);setPlacing(null);setRequested(true);}}>{i+1} · {p.title||'Sin título'}</button>)}</div></div>}
 {active&&editable&&<div className="model-point-detail" aria-label="Información del punto">{editable?<><label>Título del punto *<input value={active.title} maxLength={100} disabled={disabled} onChange={e=>edit('title',e.target.value)}/></label><label>Descripción del punto *<textarea value={active.description} rows={4} maxLength={2000} disabled={disabled} onChange={e=>edit('description',e.target.value)}/></label><div className="actions"><button type="button" className="button outline" disabled={disabled||!loaded} onClick={()=>{setPlacing(active.id);setNotice('Pulsa la nueva ubicación sobre el modelo.');}}>Recolocar punto</button><button type="button" className="quiet danger-text" disabled={disabled} onClick={()=>{if(!window.confirm('¿Eliminar este punto informativo?'))return;onHotspotsChange(hotspots.filter(p=>p.id!==active.id));setSelected(null);setPlacing(null);}}>Eliminar punto</button></div></>:<><h3>{active.title}</h3><p className="preserve">{active.description}</p></>}<button type="button" className="quiet" onClick={()=>setSelected(null)}>Cerrar información</button></div>}
 {credit&&(compact?<details className="model-credits"><summary>Créditos del modelo</summary><p className="muted">{credit}</p></details>:<p className="muted mt-4">Crédito del modelo: {credit}</p>)}
 </div></section>;
}
