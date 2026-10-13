import React from 'react';
import {Link} from 'react-router-dom';
import {BotanicalDialog} from './BotanicalDialog';
import {StorageImage} from './media';
import {habits} from './data';

export function SpeciesQuickView({plant,onClose}){
 const description=plant.description?.trim();
 return <BotanicalDialog labelledBy="quick-species-title" onClose={onClose} className="species-quick-view">
  <div className="quick-photo"><StorageImage path={plant.photo} alt={plant.common_name}/></div>
  <div className="quick-content"><p className="eyebrow">UNA MIRADA A LA COLECCIÓN</p><h2 id="quick-species-title">{plant.common_name}</h2>
   <p className="latin">{plant.scientific_name}</p><div className="quick-tags"><span>{plant.family}</span><span>{habits[plant.habit]}</span></div>
   {plant.is_demo&&<p className="notice">Registro de demostración; no acredita validación botánica.</p>}
   <p className="preserve">{description?description.length>420?description.slice(0,420)+'…':description:'Descripción pendiente de documentación.'}</p>
   {plant.photo_credit&&<p className="muted">Fotografía: {plant.photo_credit}</p>}
   <Link className="button" to={`/especies/${plant.id}/`} onClick={onClose}>Ver ficha completa</Link>
  </div>
 </BotanicalDialog>;
}
