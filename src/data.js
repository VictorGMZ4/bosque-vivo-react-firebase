import {collection,doc,getDoc,getDocs,query,where,limit} from 'firebase/firestore';
import {db} from './firebase';
export async function listSpecies(admin=false){const snapshot=await getDocs(query(collection(db,'species'),...(admin?[]:[where('is_published','==',true)]),limit(1000)));return snapshot.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.common_name.localeCompare(b.common_name,'es'));}
export async function getSpecies(id){const snapshot=await getDoc(doc(db,'species',id));if(!snapshot.exists())throw Error('La especie no existe.');return {id:snapshot.id,...snapshot.data()};}
export async function related(name,id){const snapshot=await getDocs(query(collection(db,name),where('species_id','==',id),limit(500)));return snapshot.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>name==='photos'?(a.position??0)-(b.position??0):a.code.localeCompare(b.code,'es'));}
export const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
export const habits={tree:'Árbol',shrub:'Arbusto',herb:'Herbácea',palm:'Palmera',climber:'Trepadora'};
