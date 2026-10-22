import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import QRCode from 'qrcode';
import {Icon} from './ui/Icon';
import {speciesExploreUrl} from './qr-url';
import './species-qr.css';

function Label({plant,qr,url}){
 const site=new URL(url).origin+'/';
 return <article className={`species-qr-label${plant.common_name.length>35?' qr-label--long':''}`} aria-label={`Tarjeta QR de ${plant.common_name}`}>
  <div className="qr-card-story">
   <img className="qr-card-campus" src="/images/campus-unipaz.webp" alt="" width="2560" height="1920"/>
   <svg className="qr-card-tint" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="100" fill="#063d29" fillOpacity=".82"/></svg>
   <div className="qr-label-brand"><img src="/images/brand-flower-outlined.webp" alt="" width="60" height="60"/><span>Flora Viva<small>BOSQUE VERDE · UNIPAZ</small></span></div>
   <p className="qr-label-kicker"><span/>DESCUBRE NUESTRA FLORA<span/></p>
   <div className="qr-card-botany"><h3>{plant.common_name}</h3><p className={`qr-label-scientific${plant.scientific_name.length>55?' is-long':''}`}>{plant.scientific_name}</p><p className="qr-label-family"><Icon name="leaf"/><span>Familia {plant.family}</span></p>{plant.is_demo&&<p className="qr-label-demo">Ficha de demostración</p>}</div>
   <p className="qr-label-footer">OBSERVAR · APRENDER · CONSERVAR</p>
   <small className="qr-campus-credit">Fotografía del campus: Paolo Forero Vásquez · UNIPAZ</small>
  </div>
  <div className="qr-card-scan">
   <svg className="qr-panel-fill" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="100" fill="#efeedf"/></svg>
   <p className="qr-label-call">Escanea y conoce esta<br/>especie</p>
   <div className="qr-code-frame"><img className="qr-code" src={qr} alt={`QR de ${plant.common_name}`} width="300" height="300"/></div>
   <a className="qr-site-link" href={site} aria-label="Conoce nuestro sitio web"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20M4 6h16M4 18h16"/></svg>Conoce nuestro sitio web</a>
   <p className="qr-label-url">{site.replace(/^https?:\/\//,'').replace(/\/$/,'')}</p>
   <img className="qr-unipaz-logo" src="/images/unipaz-logo.png" alt="Instituto Universitario de la Paz · UNIPAZ" width="512" height="517"/>
  </div>
 </article>;
}
export function SpeciesQR({plant}){
 const [result,setResult]=useState(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const preview=useRef(null),[revealed,setRevealed]=useState(false);
 useEffect(()=>{if(!result||!preview.current)return;if(!('IntersectionObserver' in window)){setRevealed(true);return;}const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setRevealed(true);observer.disconnect();}},{threshold:.12});observer.observe(preview.current);return()=>observer.disconnect();},[result]);
 useEffect(()=>{let alive=true;setResult(null);setError('');(async()=>{try{const url=speciesExploreUrl(plant.id,location.origin,import.meta.env.VITE_PUBLIC_SITE_URL||'');const svg=await QRCode.toString(url,{type:'svg',margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}});const png=await QRCode.toDataURL(url,{width:1200,margin:4,errorCorrectionLevel:'M'});if(alive)setResult({url,qr:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),png});}catch(e){if(alive)setError(e.message||'No se pudo generar el QR.');}})();return()=>{alive=false;};},[plant.id,attempt]);
 return <section className="qr-share-section" id="compartir"><div className="qr-share-copy"><p className="eyebrow">DEL CAMPUS A LA WEB</p><h2>Una pequeña etiqueta.<br/><em>Todo un descubrimiento.</em></h2><p>Comparte esta especie con una tarjeta del campus. El QR abre su pasaporte botánico y conserva un margen blanco para facilitar el escaneo.</p>{error&&<div role="alert" className="notice error"><p>{error}</p><button className="button outline" onClick={()=>setAttempt(n=>n+1)}>Reintentar QR</button></div>}{!result&&!error&&<p role="status">Preparando el código QR…</p>}{result&&<><div className="actions"><button className="button" onClick={()=>window.print()}>Imprimir etiqueta QR</button><a className="button outline" href={result.png} download={`flora-viva-${plant.id}.png`}>Descargar QR</a><a className="quiet" href={result.qr} download={`flora-viva-${plant.id}.svg`}>Descargar SVG</a></div><p className="muted">En el diálogo de impresión puedes elegir «Guardar como PDF». Desactiva los encabezados y pies de página del navegador.</p>{['localhost','127.0.0.1','[::1]'].includes(new URL(result.url).hostname)&&<p className="notice">Este QR apunta a tu equipo local. Para usarlo desde un teléfono, genera la etiqueta desde el sitio publicado.</p>}</>}</div>{result&&<div ref={preview} className={`qr-preview${revealed?' is-revealed':''}`}><Label plant={plant} {...result}/></div>}{result&&createPortal(<div className="qr-print-sheet"><Label plant={plant} {...result}/></div>,document.body)}</section>;
}
