import React,{useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import './botanical-dialog.css';

export function BotanicalDialog({labelledBy,onClose,children,className='',onKeyDown}){
 const dialog=useRef(null);
 useEffect(()=>{
  const node=dialog.current,previous=document.activeElement,overflow=document.body.style.overflow;
  node.showModal();document.body.style.overflow='hidden';
  return()=>{node.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 return createPortal(<dialog ref={dialog} className={`botanical-dialog ${className}`} aria-labelledby={labelledBy}
  onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={onKeyDown}
  onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}>
  <button type="button" className="dialog-close" onClick={onClose} aria-label="Cerrar" autoFocus>×</button>{children}
 </dialog>,document.body);
}
