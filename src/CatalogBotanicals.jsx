import React,{useEffect,useRef,useState} from 'react';
import './catalog-botanicals.css';
const plants=[{name:'vine',side:'left'},{name:'branch',side:'right'},{name:'banana',side:'left'},{name:'twig',side:'right'},{name:'variegated',side:'left'},{name:'palm',side:'right'},{name:'bird',side:'left'},{name:'monstera',side:'right'},{name:'caladium',side:'left'},{name:'heliconia',side:'right'}];
export function CatalogBotanicals({page=1}){
 const layer=useRef(null),[height,setHeight]=useState(0);
 useEffect(()=>{const parent=layer.current.parentElement;const update=()=>setHeight(parent.getBoundingClientRect().height);update();const resize=new ResizeObserver(update);resize.observe(parent);return()=>resize.disconnect();},[]);
 const count=Math.min(plants.length,Math.max(1,Math.floor(height/240)));
 useEffect(()=>{const nodes=layer.current.querySelectorAll('.catalog-edge'),mq=matchMedia('(prefers-reduced-motion: reduce)');let observer;
 const setup=()=>{observer?.disconnect();if(mq.matches||!('IntersectionObserver' in window)){nodes.forEach(n=>n.classList.add('is-visible'));return;}observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}});},{threshold:.12});nodes.forEach(n=>observer.observe(n));};setup();mq.addEventListener('change',setup);return()=>{observer?.disconnect();mq.removeEventListener('change',setup);};
 },[count,page]);
 return <div ref={layer} className="catalog-botanicals" aria-hidden="true">{plants.slice(0,count).map((plant,i)=><div key={`${page}-${plant.name}`} className={`catalog-edge is-${plant.side} botanical-${plant.name}`} style={{top:`${100+i*Math.max(0,height-600)/Math.max(1,count-1)}px`}}><img className="catalog-plant" src={`/images/catalog-${plant.name}.webp`} alt="" draggable="false" decoding="async"/></div>)}</div>;
}
