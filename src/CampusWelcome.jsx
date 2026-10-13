import React,{useEffect,useRef,useState} from 'react';
import './campus-welcome.css';
import {Link} from 'react-router-dom';
import {useCollectionTransition} from './CollectionTransition';

const image='/images/campus-unipaz.webp';
export function CampusWelcome(){
 const {explore,leaving}=useCollectionTransition();
 const host=useRef(null),scene=useRef(null);const [ready,setReady]=useState(false),[paused,setPaused]=useState(false);
 useEffect(()=>{
  let cancelled=false,instance,generation=0;const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const destroy=()=>{instance?.dispose();instance=undefined;scene.current=null;setReady(false);};
  async function start(){
   const current=++generation;destroy();if(motion.matches||navigator.connection?.saveData)return;
   try{const {createCampusScene}=await import('./campus-scene');if(cancelled||motion.matches||current!==generation)return;
    instance=createCampusScene(host.current,image,()=>{if(!cancelled)setReady(true);},()=>{if(!cancelled)destroy();});scene.current=instance;
   }catch{if(!cancelled)destroy();}
  }
  start();motion.addEventListener('change',start);
  return()=>{cancelled=true;motion.removeEventListener('change',start);instance?.dispose();scene.current=null;};
 },[]);
 useEffect(()=>{scene.current?.setEnabled(!paused);},[paused,ready]);
 return <section className="campus-welcome" aria-labelledby="campus-title">
  <img className="campus-photo" src={image} alt="Vista aérea del campus de UNIPAZ, con sus edificios y zonas verdes" fetchPriority="high" width="2560" height="1920"/>
  <div ref={host} className={`campus-canvas${ready?' is-ready':''}`} aria-hidden="true"/>
  <div className="campus-shade" aria-hidden="true"/>
  <div className={`campus-copy${leaving?' is-leaving':''}`}><p className="campus-kicker">UNIPAZ · FLORA VIVA · BOSQUE VERDE</p>
   <h1 id="campus-title">Conocer nuestra flora<br/><em>es el primer paso</em><br/>para conservarla.</h1>
   <p className="campus-intro">Un encuentro con la diversidad vegetal de nuestro entorno.</p>
   <Link className="campus-explore" to="/catalogo/" onClick={explore}>Explorar la colección <span aria-hidden="true">↗</span></Link>
  </div>
  <div className="campus-bottom"><Link className="campus-scroll" to="/catalogo/" onClick={explore}><span aria-hidden="true">↗</span> Entrar al catálogo</Link>
   <p className="campus-credit">© Instituto Universitario de la Paz · UNIPAZ<br/>Fotografía: Paolo Forero Vásquez</p>
  </div>
  {ready&&<button className="campus-motion" type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Activar movimiento':'Pausar movimiento'}</button>}
 </section>;
}
