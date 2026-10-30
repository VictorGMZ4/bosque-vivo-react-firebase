import React,{useEffect,useRef,useState} from 'react';
import {listSpecies,habits,normalize} from '../data';
import {messageFor} from '../firebase';
import {MapView,baseLayers,pointKey} from '../MapView';
import {StorageImage} from '../media';
import {Icon} from '../ui/Icon';
import {habitIcons,pinColors} from '../pins';
import {campus,campusRadiusKm,distanceKm} from '../campus';
export const pointsFor=plant=>(plant.map_points||[]).map(p=>({...p,key:`${plant.id}:${p.id}`,speciesId:plant.id,habit:plant.habit,title:plant.common_name,subtitle:p.type==='specimen'?`Ejemplar · ${p.caption}`:p.caption&&p.caption!==plant.common_name?p.caption:'Fotografía de registro',link:`/especies/${plant.id}/`}));
const kinds=[['all','Todos'],['photo','Fotografías'],['specimen','Ejemplares']];
// Códigos WMO de Open-Meteo agrupados por el máximo de cada tramo.
const skies=[[0,'sun','Despejado'],[3,'cloud','Parcialmente nublado'],[48,'cloud','Niebla'],[67,'rain','Lluvia'],[77,'cloud','Nieve'],[82,'rain','Chubascos'],[99,'rain','Tormenta']];
const sky=code=>skies.find(([max])=>code<=max)||skies.at(-1);
const HabitMark=({habit})=><svg viewBox="0 0 24 24" className="map-habit" aria-hidden="true"><path d={habitIcons[habit]||habitIcons.leaf}/></svg>;
export function SpeciesMap(){
 const map=useRef(null),stage=useRef(null),list=useRef(null);
 const [plants,setPlants]=useState(null),[error,setError]=useState(''),[me,setMe]=useState(null),[focus,setFocus]=useState(null),[place,setPlace]=useState(''),[busy,setBusy]=useState(false);
 const [kind,setKind]=useState('all'),[habit,setHabit]=useState('all'),[q,setQ]=useState(''),[selected,setSelected]=useState(null),[panel,setPanel]=useState(true),[layer,setLayer]=useState('satellite'),[weather,setWeather]=useState(null),[full,setFull]=useState(false);
 useEffect(()=>{listSpecies().then(rows=>setPlants(rows.filter(p=>p.map_points?.length))).catch(e=>setError(messageFor(e)));},[]);
 // Tiempo actual en el campus (Open-Meteo, gratuito y sin clave); si falla, el recuadro no aparece.
 useEffect(()=>{const abort=new AbortController();fetch(`https://api.open-meteo.com/v1/forecast?latitude=${campus.latitude}&longitude=${campus.longitude}&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=ms&timezone=America%2FBogota`,{signal:abort.signal}).then(r=>r.ok?r.json():null).then(d=>{if(Number.isFinite(d?.current?.temperature_2m))setWeather(d.current);}).catch(()=>{});return()=>abort.abort();},[]);
 useEffect(()=>{const sync=()=>setFull(document.fullscreenElement===stage.current);document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync);},[]);
 const all=(plants||[]).flatMap(pointsFor);
 const matches=(plants||[]).filter(p=>(habit==='all'||p.habit===habit)&&(!q||normalize([p.common_name,p.scientific_name,p.family].join(' ')).includes(normalize(q))));
 const visible=matches.flatMap(pointsFor).filter(p=>kind==='all'||p.type===kind),shown=matches.filter(p=>visible.some(v=>v.speciesId===p.id));
 const toCampus=()=>setFocus({...campus,zoom:17});
 // Tu ubicación solo se usa en este navegador para centrar el mapa; no se guarda ni se envía.
 function locate(){if(!navigator.geolocation){setPlace('Este navegador no permite obtener la ubicación. Te mostramos el campus.');toCampus();return;}setBusy(true);setPlace('Obteniendo tu ubicación…');navigator.geolocation.getCurrentPosition(p=>{const here={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy},km=distanceKm(here,campus);setMe(here);setBusy(false);if(km<=campusRadiusKm){setFocus({...here,zoom:18});setPlace('Estás en el campus. El punto azul marca tu posición.');}else{toCampus();setPlace(`Estás a ${km.toLocaleString('es-CO',{maximumFractionDigits:km<10?1:0})} km del campus; te mostramos el campus.`);}},()=>{setBusy(false);toCampus();setPlace('No se pudo obtener tu ubicación. Actívala en los permisos del navegador para este sitio y vuelve a intentarlo. Te mostramos el campus.');},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});}
 function choose(plant){setSelected(plant.id);map.current?.show(visible.filter(p=>p.speciesId===plant.id).map(pointKey));}
 function pick(point){setSelected(point.speciesId);list.current?.querySelector(`[data-id="${CSS.escape(point.speciesId)}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'});}
 function fullscreen(){if(document.fullscreenElement)document.exitFullscreen();else stage.current?.requestFullscreen?.().catch(()=>{});}
 const filter=(value,current,set,label,count,mark)=><button type="button" key={value} className={current===value?'is-active':''} aria-pressed={current===value} onClick={()=>set(value)}>{mark}<span>{label}</span><span className="map-count">{count}</span></button>;
 const now=weather&&sky(weather.weather_code);
 return <section className="map-page"><div className={`map-shell${panel?'':' is-collapsed'}`}>
  <aside className="map-panel" aria-label="Especies en el mapa" hidden={!panel}>
   <div className="map-panel-head"><p className="eyebrow">DÓNDE CRECEN</p><h1>Mapa de registros</h1><p className="muted" role="status">{plants?`${all.length} ${all.length===1?'punto':'puntos'} · ${plants.length} ${plants.length===1?'especie':'especies'}`:'Cargando registros…'}</p>
    <div className="actions"><button type="button" className="button small" onClick={locate} disabled={busy}><Icon name="target"/>{busy?'Buscando…':'Usar mi ubicación'}</button><button type="button" className="button outline small" onClick={toCampus}><Icon name="home"/>Ir al campus</button></div></div>
   <label className="map-search"><Icon name="search"/><span className="sr-only">Buscar especie</span><input type="search" placeholder="Buscar especie o familia…" value={q} onChange={e=>setQ(e.target.value)}/></label>
   {error&&<p className="notice error" role="alert">{error}</p>}
   <h2 className="map-group">Tipo de registro</h2>
   <div className="map-filters">{kinds.map(([value,label])=>filter(value,kind,setKind,label,all.filter(p=>value==='all'||p.type===value).length,<span className="map-dot" style={{'--pin':value==='all'?'#7d8a74':pinColors[value]}}/>))}</div>
   <h2 className="map-group">Tipo de planta</h2>
   <div className="map-filters">{[['all','Todas'],...Object.entries(habits)].map(([value,label])=>filter(value,habit,setHabit,label,(plants||[]).filter(p=>value==='all'||p.habit===value).length,<HabitMark habit={value==='all'?'leaf':value}/>))}</div>
   <h2 className="map-group">Especies <span className="map-count">{shown.length}</span></h2>
   <ul className="map-species" ref={list}>{shown.map(p=><li key={p.id}><button type="button" data-id={p.id} className={selected===p.id?'is-active':''} aria-pressed={selected===p.id} onClick={()=>choose(p)}><StorageImage path={p.photo} alt=""/><span className="map-species-text"><strong>{p.common_name}</strong><em>{p.scientific_name}</em><span className="map-tags"><span className="map-tag habit"><HabitMark habit={p.habit}/>{habits[p.habit]||'Planta'}</span>{p.family&&<span className="map-tag">{p.family}</span>}</span></span><span className="map-count">{visible.filter(v=>v.speciesId===p.id).length}</span></button></li>)}</ul>
   {plants&&!shown.length&&<p className="empty">{all.length?'Ninguna especie coincide con los filtros.':'Aún no hay fotografías ni ejemplares con ubicación.'}</p>}
  </aside>
  <button type="button" className="map-toggle" onClick={()=>setPanel(!panel)} aria-expanded={panel} aria-label={panel?'Ocultar el panel de especies':'Mostrar el panel de especies'}><Icon name="chevron"/></button>
  <div className={`map-stage${full?' is-full':''}`} ref={stage}>
   <MapView ref={map} className="map-view map-full" points={visible} selected={selected} onSelect={pick} wheel="always" controls={false} layer={layer} focus={focus} me={me} label="Mapa de registros de especies"/>
   <div className="map-topbar"><label className="map-chip"><Icon name="layers"/><span className="sr-only">Capa del mapa</span><select value={layer} onChange={e=>setLayer(e.target.value)}>{Object.entries(baseLayers).map(([key,b])=><option key={key} value={key}>{b.label}</option>)}</select></label><button type="button" className="map-chip map-square" onClick={fullscreen} aria-label={full?'Salir de pantalla completa':'Ver el mapa en pantalla completa'} title={full?'Salir de pantalla completa':'Pantalla completa'}><Icon name="expand"/></button></div>
   {now&&<div className="map-weather" title="Tiempo actual en el campus · Open-Meteo"><span><Icon name={now[1]}/>{Math.round(weather.temperature_2m)} °C</span><span><Icon name="wind"/>{weather.wind_speed_10m.toLocaleString('es-CO',{maximumFractionDigits:1})} m/s</span><small>{now[2]}</small></div>}
   <div className="map-tools"><button type="button" onClick={locate} disabled={busy} aria-label="Usar mi ubicación" title="Usar mi ubicación"><Icon name="target"/></button><button type="button" onClick={toCampus} aria-label="Ir al campus" title="Ir al campus"><Icon name="home"/></button><button type="button" onClick={()=>map.current?.zoomIn()} aria-label="Acercar" title="Acercar"><Icon name="plus"/></button><button type="button" onClick={()=>map.current?.zoomOut()} aria-label="Alejar" title="Alejar"><Icon name="minus"/></button></div>
   {place&&<div className="map-toast" role="status"><span>{place}</span><button type="button" onClick={()=>setPlace('')} aria-label="Cerrar aviso"><Icon name="close"/></button></div>}
  </div>
 </div></section>;
}
