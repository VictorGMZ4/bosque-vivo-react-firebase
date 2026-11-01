import React,{useEffect,useRef} from 'react';
import {StorageImage} from './media';
import {Icon} from './ui/Icon';
import './photo-viewer.css';

export function PhotoViewer({photos,index,onIndex,onClose}){
 const dialogRef=useRef(null),gestureRef=useRef(null),swipedRef=useRef(false),open=index!==null,total=photos.length,photo=photos[index];
 useEffect(()=>{if(!open)return;const dialog=dialogRef.current,focused=document.activeElement,overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=overflow;gestureRef.current=null;swipedRef.current=false;if(focused?.isConnected)focused.focus?.({preventScroll:true});};},[open]);
 function move(direction){if(total>1)onIndex((index+direction+total)%total);}
 function keyboard(event){if(!total||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();if(event.key==='Home')onIndex(0);else if(event.key==='End')onIndex(total-1);else move(event.key==='ArrowLeft'?-1:1);}
 function pointerDown(event){swipedRef.current=false;if(event.pointerType==='mouse'||!event.isPrimary||event.target.closest('button'))return;gestureRef.current={id:event.pointerId,x:event.clientX,y:event.clientY,time:event.timeStamp};}
 function pointerUp(event){const start=gestureRef.current;gestureRef.current=null;if(!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y,elapsed=Math.max(1,event.timeStamp-start.time);if(Math.abs(dx)>Math.abs(dy)&&(Math.abs(dx)>50||Math.abs(dx)/elapsed>0.11)){swipedRef.current=true;move(dx<0?1:-1);}}
 function navigation(direction){return <button type="button" className={`photo-viewer-button photo-viewer-${direction<0?'previous':'next'}`} aria-label={direction<0?'Foto anterior':'Foto siguiente'} onClick={()=>move(direction)}><Icon name="chevron"/></button>;}
 if(!open)return null;
 return <dialog ref={dialogRef} className="photo-viewer" aria-label="Galería de fotografías" onCancel={event=>{event.preventDefault();onClose();}} onKeyDown={keyboard}><header className="photo-viewer-top"><span aria-live="polite" aria-atomic="true">{total?index+1:0} / {total}</span><button type="button" className="photo-viewer-button" aria-label="Cerrar la galería" autoFocus onClick={onClose}><Icon name="close"/></button></header><div className="photo-viewer-middle" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={()=>{gestureRef.current=null;}} onClick={event=>{if(swipedRef.current){swipedRef.current=false;return;}if(event.target===event.currentTarget)onClose();}}>{total>1&&navigation(-1)}{photo&&<StorageImage key={photo.path} path={photo.path} alt={photo.caption||'Fotografía de la especie'} className="photo-viewer-image" draggable={false}/>}{total>1&&navigation(1)}</div><footer className="photo-viewer-caption"><p>{photo?.caption}</p>{photo?.credit&&<p className="photo-viewer-credit">{photo.credit}</p>}</footer>{total>1&&<nav className="photo-viewer-mobile-nav" aria-label="Navegación de fotografías">{navigation(-1)}{navigation(1)}</nav>}</dialog>;
}
