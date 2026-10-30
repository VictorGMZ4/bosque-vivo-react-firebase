import React,{useEffect,useState} from 'react';
import {listSpecies} from '../data';
import {messageFor} from '../firebase';
import {MapView} from '../MapView';
export const pointsFor=plant=>(plant.map_points||[]).map(p=>({...p,title:plant.common_name,subtitle:p.type==='specimen'?`Ejemplar · ${p.caption}`:p.caption&&p.caption!==plant.common_name?p.caption:'Fotografía de registro',link:`/especies/${plant.id}/`}));
export function SpeciesMap(){
 const [points,setPoints]=useState(null),[error,setError]=useState('');
 useEffect(()=>{listSpecies().then(rows=>setPoints(rows.flatMap(pointsFor))).catch(e=>setError(messageFor(e)));},[]);
 const species=new Set((points||[]).map(p=>p.link)).size;
 return <section><p className="eyebrow">DÓNDE CRECEN</p><h1>Mapa de registros</h1><p>Cada punto marca dónde se tomó una fotografía de la colección <span className="map-key photo">●</span> o dónde está un ejemplar documentado <span className="map-key specimen">●</span>. Toca un punto para ver la especie.</p>{error&&<p className="notice error" role="alert">{error}</p>}<p role="status">{points?`${points.length} ${points.length===1?'punto':'puntos'} de ${species} ${species===1?'especie':'especies'}`:'Cargando registros…'}</p><MapView points={points||[]} label="Mapa de registros de especies"/>{points&&!points.length&&<p className="empty">Aún no hay fotografías ni ejemplares con ubicación.</p>}</section>;
}
