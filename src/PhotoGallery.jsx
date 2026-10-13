import React,{useRef,useState} from 'react';
import {BotanicalDialog} from './BotanicalDialog';
import {StorageImage} from './media';

export function PhotoGallery({items,name}){
 const [selected,setSelected]=useState(null),[zoom,setZoom]=useState(false),touch=useRef(null);
 function select(index){setSelected(index);setZoom(false);}
 function step(delta){select((selected+delta+items.length)%items.length);}
 const photo=selected===null?null:items[selected];
 if(!items.length)return <p className="empty">Todavía no hay fotografías disponibles.</p>;
 return <>
  <p className="muted">Selecciona una fotografía para ampliarla y explorar sus detalles.</p>
  <div className="detail-gallery">{items.map((item,i)=><figure key={item.id||item.path}>
   <button className="gallery-open" type="button" aria-label={`Ampliar: ${item.caption}`} onClick={()=>select(i)}><StorageImage path={item.path} alt={item.caption} loading="lazy"/><span aria-hidden="true">Ampliar ↗</span></button>
   <figcaption><strong>{item.caption}</strong>{item.credit&&<span>{item.credit}</span>}</figcaption>
  </figure>)}</div>
  {photo&&<BotanicalDialog labelledBy="gallery-dialog-title" className="photo-dialog" onClose={()=>setSelected(null)} onKeyDown={e=>{
   if(['ArrowLeft','ArrowRight'].includes(e.key)&&!zoom){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}
  }}>
   <header className="photo-dialog-heading"><p className="eyebrow">{name}</p><h2 id="gallery-dialog-title">{photo.caption}</h2></header>
   <div className={`photo-stage${zoom?' is-zoomed':''}`} key={selected}
    onTouchStart={e=>{if(e.touches.length===1)touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch.current=null;}}
    onTouchCancel={()=>{touch.current=null;}}
    onTouchEnd={e=>{const start=touch.current;touch.current=null;if(!start||zoom||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)step(dx<0?1:-1);}}>
    <StorageImage path={photo.path} alt={photo.caption}/>
   </div>
   <div className="photo-tools"><button type="button" className="button outline" disabled={items.length<2} onClick={()=>step(-1)} aria-label="Fotografía anterior">←</button>
    <span role="status">{selected+1} / {items.length}</span>
    <button type="button" className="button outline" onClick={()=>setZoom(!zoom)} aria-pressed={zoom}>{zoom?'Restablecer tamaño':'Acercar fotografía'}</button>
    <button type="button" className="button outline" disabled={items.length<2} onClick={()=>step(1)} aria-label="Fotografía siguiente">→</button>
   </div>
   <p className="photo-credit">{photo.credit||'Crédito fotográfico pendiente.'}</p>
   <div className="photo-thumbnails" aria-label="Fotografías de la especie">{items.map((item,i)=><button type="button" key={item.id||item.path} aria-label={`Ver ${item.caption}`} aria-pressed={selected===i} onClick={()=>select(i)}><StorageImage path={item.path} alt="" loading="lazy"/></button>)}</div>
  </BotanicalDialog>}
 </>;
}
