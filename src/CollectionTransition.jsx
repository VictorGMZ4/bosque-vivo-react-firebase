import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';

const TransitionContext=createContext();
export const useCollectionTransition=()=>useContext(TransitionContext);
export function CollectionTransition({children}){
 const navigate=useNavigate(),location=useLocation();const [phase,setPhase]=useState('');
 const timers=useRef([]),running=useRef(false);
 function clear(){timers.current.forEach(clearTimeout);timers.current=[];running.current=false;setPhase('');}
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{
  if(phase!=='arrive')return;
  const frame=requestAnimationFrame(()=>document.getElementById('coleccion')?.scrollIntoView({behavior:'instant',block:'start'}));
  return()=>cancelAnimationFrame(frame);
 },[phase]);
 useEffect(()=>{if(location.pathname!=='/'&&location.pathname!=='/catalogo/')clear();},[location.pathname]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>{if(media.matches&&running.current){clear();navigate('/catalogo/');}};
  media.addEventListener('change',change);return()=>media.removeEventListener('change',change);
 },[navigate]);
 function explore(event){
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(running.current)return;
  if(event.detail===0||matchMedia('(prefers-reduced-motion: reduce)').matches){navigate('/catalogo/');return;}
  running.current=true;setPhase('depart');
  timers.current.push(setTimeout(()=>{navigate('/catalogo/',{state:{fromWelcome:true}});setPhase('arrive');},360));
  timers.current.push(setTimeout(()=>{clear();document.querySelector('#coleccion h2')?.focus({preventScroll:true});},920));
 }
 return <TransitionContext.Provider value={{explore,leaving:phase==='depart',active:!!phase}}><div className={phase?`collection-transition--${phase}`:undefined}>{children}</div>
  {phase==='arrive'&&<div className="campus-route-bridge" aria-hidden="true"><img src="/images/campus-unipaz.webp" alt=""/><div className="campus-route-shade"/></div>}
 </TransitionContext.Provider>;
}
