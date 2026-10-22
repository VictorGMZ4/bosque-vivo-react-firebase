import React,{useEffect,useRef} from 'react';
import {placeCallout} from './hotspot-callout';
export function HotspotCallout({viewer,point,onClose}){
 const box=useRef(null),line=useRef(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const model=viewer.current,node=box.current;if(!model||!node)return;let frame;
  const update=()=>{
   const info=model.queryHotspot(`hotspot-${point.id}`),w=model.clientWidth,h=model.clientHeight;
   if(info&&w&&h){const {x,y}=info.canvasPosition,bounds=placeCallout({x,y,width:w,height:h,boxWidth:node.offsetWidth,boxHeight:node.offsetHeight});node.style.left=`${bounds.left}px`;node.style.top=`${bounds.top}px`;node.style.visibility='visible';
    const edgeX=Math.max(bounds.left+16,Math.min(x,bounds.left+node.offsetWidth-16)),edgeY=bounds.above?bounds.top+node.offsetHeight:bounds.top;
    line.current?.setAttribute('d',`M ${Math.max(0,Math.min(w,x))} ${Math.max(0,Math.min(h,y))} L ${edgeX} ${edgeY}`);
   }
   frame=requestAnimationFrame(update);
  };frame=requestAnimationFrame(update);
  return()=>cancelAnimationFrame(frame);
 },[viewer,point.id]);
 return <><svg className="hotspot-connector" aria-hidden="true"><path ref={line}/></svg><div ref={box} className="hotspot-callout" role="region" aria-label={`Información: ${point.title||'Punto seleccionado'}`} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();close.current();}}}>
 <div className="hotspot-callout-heading"><h3>{point.title||'Punto seleccionado'}</h3><button type="button" aria-label="Cerrar viñeta" onClick={onClose}>×</button></div><p>{point.description||'Completa la información de este punto en el editor.'}</p>
 </div></>;
}
