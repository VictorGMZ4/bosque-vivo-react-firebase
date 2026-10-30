import React,{useEffect,useState} from 'react';
import {MapView} from './MapView';
import {photoLocation,deviceLocation,sourceLabels} from './location';
// Ubicación opcional de una fotografía; al elegir otro archivo se toma su GPS o se retira la anterior.
export function LocationPicker({file,value,onChange,disabled,habit}){
 const [status,setStatus]=useState(''),[picking,setPicking]=useState(false);
 useEffect(()=>{if(!file)return;let alive=true;setStatus('Buscando la ubicación en la fotografía…');photoLocation(file).then(found=>{if(!alive)return;onChange(found);setStatus(found?'':'La fotografía no trae ubicación. Usa tu ubicación actual o márcala en el mapa.');});return()=>{alive=false;};},[file]);
 async function device(){setStatus('Obteniendo tu ubicación…');try{onChange(await deviceLocation());setStatus('');}catch(e){setStatus(e.message);}}
 return <div className="location-picker"><p className="muted">{value?`Ubicación ${sourceLabels[value.source]}: ${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`:'Sin ubicación (opcional).'}</p>{status&&<p role="status">{status}</p>}<div className="actions"><button type="button" className="button outline small" onClick={device} disabled={disabled}>Usar mi ubicación actual</button><button type="button" className="button outline small" onClick={()=>setPicking(!picking)} disabled={disabled}>{picking?'Cerrar mapa':'Marcar en el mapa'}</button>{value&&<button type="button" className="quiet danger-text" onClick={()=>onChange(null)} disabled={disabled}>Quitar ubicación</button>}</div>{(picking||value)&&<MapView className="map-view small" points={value?[{...value,type:'photo',habit}]:[]} onPick={picking&&!disabled?onChange:undefined} label="Ubicación de la fotografía"/>}{picking&&<p className="muted">Toca el mapa en el lugar exacto donde se tomó la fotografía.</p>}</div>;
}
