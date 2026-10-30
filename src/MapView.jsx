import React,{useEffect,useImperativeHandle,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getBlob,ref as storageRef} from 'firebase/storage';
import {storage} from './firebase';
import {campus} from './campus';
import {pinHtml,pinColors} from './pins';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Vista inicial sin puntos: el campus de UNIPAZ.
const start=[campus.latitude,campus.longitude];
export const baseLayers={satellite:{label:'Satélite',url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',attribution:'Imágenes © Esri, Maxar, Earthstar Geographics'},streets:{label:'Calles',url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',attribution:'© colaboradores de OpenStreetMap'}};
export const pointKey=p=>p.key||`${p.type}:${p.id||''}:${p.latitude},${p.longitude}`;
const chosen=(p,selected)=>selected!=null&&(pointKey(p)===selected||p.speciesId===selected);
// wheel: 'always' acerca con la rueda siempre; 'click' solo tras hacer clic, para no atrapar el desplazamiento de la página.
// focus {latitude,longitude,zoom} desplaza la vista; me {latitude,longitude,accuracy} dibuja «Estás aquí».
// controls=false oculta zoom y capas de Leaflet para que la página ponga los suyos (layer elige la capa); ref expone zoomIn, zoomOut y show(keys).
export function MapView({points=[],onPick,onSelect,selected,className='map-view',label='Mapa',wheel='click',focus,me,layer='satellite',controls=true,ref}){
 const box=useRef(null),state=useRef({}),navigate=useNavigate(),[error,setError]=useState('');
 function icon(p){return state.current.L.divIcon({className:'map-pin-icon',html:pinHtml(p,chosen(p,selected)),iconSize:[36,46],iconAnchor:[18,45],popupAnchor:[0,-40]});}
 function draw(){const {L,map,layer:group}=state.current;if(!map)return;group.clearLayers();const markers=new Map(),bounds=[];
  for(const p of points){const marker=L.marker([p.latitude,p.longitude],{icon:icon(p),title:p.title||'',alt:p.title||'Punto',keyboard:!!p.title,riseOnHover:true,zIndexOffset:chosen(p,selected)?1000:0}).addTo(group);marker.on('click',()=>state.current.select?.(p));
   if(p.title)marker.bindPopup(`${p.path?`<img data-path="${escape(p.path)}" alt="" class="map-thumb">`:''}<span class="map-popup-type" style="--pin:${pinColors[p.type]||pinColors.photo}">${p.type==='specimen'?'Ejemplar':'Fotografía'}</span><strong>${escape(p.title)}</strong>${p.subtitle?`<span>${escape(p.subtitle)}</span>`:''}${p.link?`<a href="${escape(p.link)}" data-spa>Ver ficha →</a>`:''}`,{className:'map-popup',maxWidth:240});
   markers.set(pointKey(p),{marker,point:p});bounds.push([p.latitude,p.longitude]);}
  state.current.markers=markers;if(bounds.length===1)map.setView(bounds[0],Math.max(map.getZoom(),17));else if(bounds.length)map.fitBounds(bounds,{padding:[40,40],maxZoom:18});}
 function highlight(){for(const {marker,point} of state.current.markers?.values()||[]){marker.setIcon(icon(point));marker.setZIndexOffset(chosen(point,selected)?1000:0);}}
 function base(){const {L,map,tiles}=state.current;if(!map||controls)return;const next=baseLayers[layer]?layer:'satellite';if(tiles.current===next)return;if(tiles.current)map.removeLayer(tiles[tiles.current]);tiles[next].addTo(map);tiles.current=next;}
 useEffect(()=>{let alive=true;(async()=>{const L=(await import('leaflet')).default;await import('leaflet/dist/leaflet.css');if(!alive||!box.current)return;
  const map=L.map(box.current,{scrollWheelZoom:wheel==='always',zoomControl:controls}).setView(start,16);
  if(wheel==='click'){map.on('click',()=>map.scrollWheelZoom.enable());map.on('mouseout',()=>map.scrollWheelZoom.disable());}
  const tiles=Object.fromEntries(Object.entries(baseLayers).map(([key,b])=>[key,L.tileLayer(b.url,{maxZoom:19,attribution:b.attribution})]));
  if(controls){tiles.satellite.addTo(map);L.control.layers({[baseLayers.satellite.label]:tiles.satellite,[baseLayers.streets.label]:tiles.streets}).addTo(map);}
  const watch=new ResizeObserver(()=>map.invalidateSize());watch.observe(box.current);
  state.current={...state.current,L,map,tiles,watch,layer:L.layerGroup().addTo(map),here:L.layerGroup().addTo(map)};
  map.on('click',e=>state.current.pick?.({latitude:e.latlng.lat,longitude:e.latlng.lng,source:'manual'}));
  map.on('popupopen',async e=>{const img=e.popup.getElement()?.querySelector('img[data-path]');if(img&&!img.src)try{img.src=URL.createObjectURL(await getBlob(storageRef(storage,img.dataset.path)));}catch{img.remove();}});
  map.on('popupclose',e=>{const img=e.popup.getElement()?.querySelector('img[data-path]');if(img?.src){URL.revokeObjectURL(img.src);img.removeAttribute('src');}});
  state.current.sync();})().catch(()=>setError('No se pudo cargar el mapa. Comprueba tu conexión.'));return()=>{alive=false;state.current.watch?.disconnect();state.current.map?.remove();state.current={};};},[]);
 function locate(){const {L,here}=state.current;if(!here)return;here.clearLayers();if(!me)return;L.circle([me.latitude,me.longitude],{radius:Math.min(me.accuracy||0,500),color:pinColors.me,weight:1,fillOpacity:.12,interactive:false}).addTo(here);L.circleMarker([me.latitude,me.longitude],{radius:8,color:'#fff',weight:3,fillColor:pinColors.me,fillOpacity:1}).bindTooltip('Estás aquí').addTo(here);}
 // flyTo falla (NaN) si el contenedor aún no tiene tamaño; entonces, o con movimiento reducido, se salta sin animar.
 function go(target,zoom){const {map}=state.current;if(!map)return;const size=map.invalidateSize().getSize();if(!size.x||!size.y||matchMedia('(prefers-reduced-motion: reduce)').matches)map.setView(target,zoom);else map.flyTo(target,zoom,{duration:1});}
 function move(){if(focus)go([focus.latitude,focus.longitude],focus.zoom||17);}
 useImperativeHandle(ref,()=>({zoomIn:()=>state.current.map?.zoomIn(),zoomOut:()=>state.current.map?.zoomOut(),show(keys){const {map,markers}=state.current;const found=keys.map(k=>markers?.get(k)).filter(Boolean);if(!map||!found.length)return;if(found.length===1){const {marker}=found[0];go(marker.getLatLng(),Math.max(map.getZoom(),18));marker.openPopup();}else map.fitBounds(found.map(f=>f.marker.getLatLng()),{padding:[60,60],maxZoom:18});}}),[]);
 const key=JSON.stringify(points.map(p=>[pointKey(p),p.latitude,p.longitude,p.title,p.subtitle,p.habit]));
 Object.assign(state.current,{pick:onPick,select:onSelect,sync:()=>{base();draw();locate();move();}});
 useEffect(draw,[key]);useEffect(highlight,[selected]);useEffect(base,[layer]);useEffect(locate,[me?.latitude,me?.longitude,me?.accuracy]);useEffect(move,[focus]);
 return <div className="map-wrap">{(error||!navigator.onLine)&&<p className="notice error" role="alert">{error||'El mapa necesita conexión a internet.'}</p>}<div ref={box} className={className} role="region" aria-label={label} onClick={e=>{const link=e.target.closest('a[data-spa]');if(link){e.preventDefault();navigate(link.getAttribute('href'));}}}/>{wheel==='click'&&<p className="muted">Haz clic en el mapa para acercar o alejar con la rueda del ratón.</p>}</div>;
}
