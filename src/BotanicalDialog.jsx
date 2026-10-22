import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import './botanical-dialog.css';

export function BotanicalDialog({labelledBy,onClose,children,className='',onKeyDown,origin}){
 const dialog=useRef(null),timer=useRef(null),[closing,setClosing]=useState(false);
 const requestClose=()=>{if(timer.current)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setClosing(true);timer.current=setTimeout(onClose,160);};
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{
  const node=dialog.current,previous=document.activeElement,overflow=document.body.style.overflow;
  node.showModal();document.body.style.overflow='hidden';
  return()=>{node.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 return createPortal(<dialog ref={dialog} className={`botanical-dialog ${className}${closing?' is-closing':''}`} style={origin?{'--quick-x':`${origin.x}px`,'--quick-y':`${origin.y}px`}:undefined} aria-labelledby={labelledBy}
  onCancel={e=>{e.preventDefault();requestClose();}} onKeyDown={onKeyDown}
  onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)requestClose();}}>
  <button type="button" className="dialog-close" onClick={requestClose} aria-label="Cerrar" autoFocus>×</button>{children}
 </dialog>,document.body);
}
