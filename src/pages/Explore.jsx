import React,{useEffect,useRef,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {getSpecies,habits} from '../data';
import {useAuth} from '../auth';
import {messageFor} from '../firebase';
import {StorageImage} from '../media';
import {ModelViewer} from '../ModelViewer';
import '../species-passport.css';

export function Explore(){const {id}=useParams();return <Passport key={id} id={id}/>;}
function Passport({id}){
 const {ready,admin}=useAuth(),[plant,setPlant]=useState(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[hidden,setHidden]=useState(document.hidden),[modelOpen,setModelOpen]=useState(false),card=useRef(null);
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(mq.matches),visibility=()=>setHidden(document.hidden);update();mq.addEventListener('change',update);document.addEventListener('visibilitychange',visibility);return()=>{mq.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility);};},[]);
 useEffect(()=>{if(!ready)return;let alive=true;setError('');getSpecies(id).then(p=>{if(alive)setPlant(p);}).catch(e=>{if(alive)setError(messageFor(e));});return()=>{alive=false;};},[id,ready,admin,attempt]);
 useEffect(()=>{const old=document.title;if(plant)document.title=`${plant.common_name} · Flora Viva`;return()=>{document.title=old;};},[plant]);
 if(error)return <div className="passport-state"><h1>No pudimos abrir esta especie</h1><p role="alert">{error}</p><button className="button" onClick={()=>setAttempt(n=>n+1)}>Reintentar</button><Link to="/catalogo/">Ir a la colección</Link></div>;
 if(!plant)return <div className="passport-state" role="status">Preparando tu encuentro con la naturaleza…</div>;
 const stopped=paused||reduced||hidden||modelOpen;
 const description=(plant.description||'Descripción pendiente de documentación.').split(/\r?\n\s*\r?\n/)[0];
 function shine(e){if(stopped||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();card.current.style.setProperty('--px',`${30+40*(e.clientX-r.left)/r.width}%`);card.current.style.setProperty('--py',`${30+40*(e.clientY-r.top)/r.height}%`);}
 return <div className={`passport-stage${stopped?' is-paused':''}`}>
 <article ref={card} className="species-passport" onPointerMove={shine} aria-labelledby="passport-title">
  <div className="passport-foil" aria-hidden="true"/>
  <header className="passport-head"><span>FLORA VIVA / COLECCIÓN BOTÁNICA</span><button type="button" aria-label={paused?'Activar animación':'Pausar animación'} title={paused?'Activar animación':'Pausar animación'} aria-pressed={paused} onClick={()=>setPaused(p=>!p)} disabled={reduced}>{paused||reduced?'▷':'Ⅱ'}</button></header>
  <figure className="passport-photo"><StorageImage path={plant.photo} alt={plant.common_name}/><figcaption><span>{plant.family||'Familia sin registrar'}</span><span>{habits[plant.habit]||''}</span></figcaption></figure>
  <div className="passport-content"><p className="passport-overline">TU ENCUENTRO CON LA NATURALEZA</p><h1 id="passport-title">{plant.common_name}</h1><p className="passport-latin">{plant.scientific_name}</p>
   {!plant.is_published&&<p className="passport-notice">Borrador · Solo visible para el equipo administrador.</p>}{plant.is_demo&&<p className="passport-notice">Registro de demostración. No acredita presencia ni validación botánica.</p>}
   <p className="passport-description">{description}</p>
   <dl><div><dt>Familia</dt><dd>{plant.family||'Sin registrar'}</dd></div><div><dt>Hábito</dt><dd>{habits[plant.habit]||'Sin registrar'}</dd></div></dl>
   {plant.photo_credit&&<p className="passport-credit">Fotografía: {plant.photo_credit}</p>}
   {plant.model_3d&&<details className="passport-model" onToggle={e=>{if(e.target===e.currentTarget)setModelOpen(e.currentTarget.open);}}><summary><span aria-hidden="true">◇</span><span>Explora la especie en 3D<small>Gira, acerca y observa</small></span><span className="passport-plus" aria-hidden="true">+</span></summary>{modelOpen&&<ModelViewer compact autoLoad path={plant.model_3d} name={plant.common_name} credit={plant.model_credit} hotspots={plant.model_hotspots||[]}/>}</details>}
  </div>
  <footer className="passport-stub"><i className="passport-notch left" aria-hidden="true"/><i className="passport-notch right" aria-hidden="true"/><p>OBSERVAR · APRENDER · CONSERVAR</p><Link to={`/especies/${encodeURIComponent(id)}/`}>Ver ficha completa <span aria-hidden="true">↗</span></Link><small>PASAPORTE BOTÁNICO <span>UNIPAZ</span></small></footer>
 </article></div>;
}
