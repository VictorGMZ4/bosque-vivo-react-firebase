import React,{useEffect,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getBlob,ref} from 'firebase/storage';
import {storage} from './firebase';
import {campus} from './campus';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Vista inicial sin puntos: el campus de UNIPAZ.
const start=[campus.latitude,campus.longitude];
// wheel: 'always' acerca con la rueda siempre; 'click' solo tras hacer clic, para no atrapar el desplazamiento de la página.
// focus {latitude,longitude,zoom} desplaza la vista; me {latitude,longitude,accuracy} dibuja «Estás aquí».
export function MapView({points=[],onPick,className='map-view',label='Mapa',wheel='click',focus,me}){
 const box=useRef(null),state=useRef({}),navigate=useNavigate(),[error,setError]=useState('');
 function draw(){const {L,map,layer}=state.current;if(!map)return;layer.clearLayers();const bounds=[];for(const p of points){const marker=L.circleMarker([p.latitude,p.longitude],{radius:8,color:'#fff',weight:2,fillColor:p.type==='specimen'?'#8c6517':'#1f4d3a',fillOpacity:.95}).addTo(layer);if(p.title)marker.bindPopup(`${p.path?`<img data-path="${escape(p.path)}" alt="" class="map-thumb">`:''}<strong>${escape(p.title)}</strong>${p.subtitle?`<br><span>${escape(p.subtitle)}</span>`:''}${p.link?`<br><a href="${escape(p.link)}" data-spa>Ver ficha</a>`:''}`);bounds.push([p.latitude,p.longitude]);}
  if(bounds.length===1)map.setView(bounds[0],Math.max(map.getZoom(),17));else if(bounds.length)map.fitBounds(bounds,{padding:[30,30],maxZoom:18});}
 useEffect(()=>{let alive=true;(async()=>{const L=(await import('leaflet')).default;await import('leaflet/dist/leaflet.css');if(!alive||!box.current)return;
  const map=L.map(box.current,{scrollWheelZoom:wheel==='always'}).setView(start,16);
  if(wheel==='click'){map.on('click',()=>map.scrollWheelZoom.enable());map.on('mouseout',()=>map.scrollWheelZoom.disable());}
  const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Imágenes © Esri, Maxar, Earthstar Geographics'}),streets=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© colaboradores de OpenStreetMap'});
  satellite.addTo(map);L.control.layers({'Satélite':satellite,'Calles':streets}).addTo(map);
  state.current={...state.current,L,map,layer:L.layerGroup().addTo(map),here:L.layerGroup().addTo(map)};
  map.on('click',e=>state.current.pick?.({latitude:e.latlng.lat,longitude:e.latlng.lng,source:'manual'}));
  map.on('popupopen',async e=>{const img=e.popup.getElement()?.querySelector('img[data-path]');if(img&&!img.src)try{img.src=URL.createObjectURL(await getBlob(ref(storage,img.dataset.path)));}catch{img.remove();}});
  map.on('popupclose',e=>{const img=e.popup.getElement()?.querySelector('img[data-path]');if(img?.src){URL.revokeObjectURL(img.src);img.removeAttribute('src');}});
  state.current.sync();})().catch(()=>setError('No se pudo cargar el mapa. Comprueba tu conexión.'));return()=>{alive=false;state.current.map?.remove();state.current={};};},[]);
 function locate(){const {L,here}=state.current;if(!here)return;here.clearLayers();if(!me)return;L.circle([me.latitude,me.longitude],{radius:Math.min(me.accuracy||0,500),color:'#2a6fdb',weight:1,fillOpacity:.12,interactive:false}).addTo(here);L.circleMarker([me.latitude,me.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#2a6fdb',fillOpacity:1}).bindTooltip('Estás aquí').addTo(here);}
 // flyTo falla (NaN) si el contenedor aún no tiene tamaño; entonces, o con movimiento reducido, se salta sin animar.
 function move(){const {map}=state.current;if(!map||!focus)return;const target=[focus.latitude,focus.longitude],zoom=focus.zoom||17,size=map.invalidateSize().getSize();if(!size.x||!size.y||matchMedia('(prefers-reduced-motion: reduce)').matches)map.setView(target,zoom);else map.flyTo(target,zoom,{duration:1});}
 const key=JSON.stringify(points.map(p=>[p.latitude,p.longitude,p.title,p.subtitle]));
 state.current.pick=onPick;state.current.sync=()=>{draw();locate();move();};useEffect(draw,[key]);useEffect(locate,[me?.latitude,me?.longitude,me?.accuracy]);useEffect(move,[focus]);
 return <div className="map-wrap">{(error||!navigator.onLine)&&<p className="notice error" role="alert">{error||'El mapa necesita conexión a internet.'}</p>}<div ref={box} className={className} role="region" aria-label={label} onClick={e=>{const link=e.target.closest('a[data-spa]');if(link){e.preventDefault();navigate(link.getAttribute('href'));}}}/>{wheel==='click'&&<p className="muted">Haz clic en el mapa para acercar o alejar con la rueda del ratón.</p>}</div>;
}
