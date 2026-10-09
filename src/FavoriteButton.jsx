import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from './auth';
import {workspace,messageFor} from './firebase';
export function FavoriteButton({plant}){
 const {user,ready}=useAuth(),[saved,setSaved]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let active=true;setLoaded(false);setSaved(false);setError('');if(user)workspace({action:'collectionList'}).then(data=>{if(active){setSaved(data.favorites.some(f=>f.species_id===plant.id));setLoaded(true);}}).catch(e=>{if(active)setError(messageFor(e));});return()=>{active=false;};},[user?.uid,plant.id]);
 async function toggle(){setBusy(true);setError('');try{await workspace({action:saved?'favoriteRemove':'favoriteSave',species_id:plant.id});setSaved(!saved);}catch(e){setError(messageFor(e));}finally{setBusy(false);}}
 if(!ready||!plant.is_published)return null;
 if(!user)return <Link className="button outline" to="/ingresar/">Inicia sesión para guardar</Link>;
 return <div><button className="button outline" aria-pressed={saved} disabled={busy||!loaded} onClick={toggle}>{busy?'Guardando…':saved?'Quitar de favoritos':'Guardar especie'}</button>{saved&&<p role="status">Guardada. <Link to="/mi-coleccion/">Organizar en mi colección</Link></p>}{error&&<p role="alert" className="notice error">{error}</p>}</div>;
}
