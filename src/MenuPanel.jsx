import React,{useEffect,useRef,useState} from 'react';
import {NavLink,useLocation} from 'react-router-dom';
import {useAuth} from './auth';
import {InstallApp} from './offline';
import {Icon} from './ui/Icon';
import './menu-panel.css';

export function MenuPanel(){
 const {user,admin}=useAuth(),location=useLocation(),[open,setOpen]=useState(false),[top,setTop]=useState(0),wrapRef=useRef(null),triggerRef=useRef(null),panelRef=useRef(null);
 useEffect(()=>{setOpen(false);},[location]);
 useEffect(()=>{if(!open)return;panelRef.current?.querySelector('a[href]')?.focus();const outside=event=>{if(!wrapRef.current?.contains(event.target))setOpen(false);},keyboard=event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);triggerRef.current?.focus();}},measure=()=>setTop(triggerRef.current.getBoundingClientRect().bottom+8);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',keyboard);window.addEventListener('resize',measure);window.addEventListener('scroll',measure,true);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',keyboard);window.removeEventListener('resize',measure);window.removeEventListener('scroll',measure,true);};},[open]);
 function navigate(event){if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;const items=Array.from(panelRef.current.querySelectorAll('a[href],button:not(:disabled)')),index=items.indexOf(document.activeElement);if(!items.length)return;event.preventDefault();items[event.key==='Home'?0:event.key==='End'?items.length-1:event.key==='ArrowDown'?(index+1)%items.length:(index-1+items.length)%items.length].focus();}
 const groups=[['explorar',[['/mapa/','map','Mapa'],['/comparar/','compare','Comparar especies'],['/aprender/','book','Aprender']]],['espacio',user?[['/mi-coleccion/','heart','Mi colección'],['/notificaciones/','bell','Notificaciones']]:[]],['admin',admin?[['/historial/','history','Historial y papelera']]:[]],['app',[['/sin-conexion/','offline','Sin conexión']]]];
 return <div className="menu-panel-wrap" ref={wrapRef}><button ref={triggerRef} className="rail-menu-button menu-trigger" type="button" aria-expanded={open} aria-controls="menu-panel" aria-haspopup="true" onClick={()=>{if(!open)setTop(triggerRef.current.getBoundingClientRect().bottom+8);setOpen(value=>!value);}}><Icon name="menu"/><span>Menú</span></button>{open&&<div id="menu-panel" className="menu-panel" ref={panelRef} style={{'--menu-panel-top':`${top}px`}} onKeyDown={navigate}><nav aria-label="Menú de herramientas">{groups.filter(([,items])=>items.length).map(([id,items],index)=><React.Fragment key={id}>{index>0&&<div className="menu-panel-divider"/>}<div className="menu-panel-group">{items.map(([path,icon,name])=><NavLink key={path} to={path} onClick={()=>setOpen(false)}><Icon name={icon}/><span>{name}</span></NavLink>)}{id==='app'&&<InstallApp icon={<Icon name="install"/>}/>}</div></React.Fragment>)}</nav></div>}</div>;
}
