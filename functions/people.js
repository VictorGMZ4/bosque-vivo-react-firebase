import {db,authAdmin} from './firebase.js';
// Nombre y correo de cada UID para mostrar autorías; una cuenta inexistente queda como {name:'',email:''}.
export async function peopleFor(uids){
 const ids=[...new Set(uids.filter(id=>typeof id==='string'&&id))],people={};
 for(let i=0;i<ids.length;i+=100){
  const chunk=ids.slice(i,i+100),[accounts,profiles]=await Promise.all([authAdmin.getUsers(chunk.map(uid=>({uid}))),db.getAll(...chunk.map(uid=>db.collection('profiles').doc(uid)))]);
  const byUid=new Map(accounts.users.map(u=>[u.uid,u]));
  chunk.forEach((uid,index)=>{const u=byUid.get(uid);people[uid]={name:profiles[index].data()?.name||u?.displayName||'',email:u?.email||''};});
 }
 return people;
}
