import {db} from './firebase.js';
import {fail} from './domain.js';
export const roles=['student','teacher','researcher','admin'];
export async function roleFor(auth,tx){
 if(!auth)fail('Inicia sesión para continuar.','unauthenticated');
 const ref=db.collection('roles').doc(auth.uid),snapshot=tx?await tx.get(ref):await ref.get();
 if(snapshot.data()?.disabled===true)fail('Tu cuenta está bloqueada. Contacta con la administración.','permission-denied');
 const role=snapshot.exists?snapshot.data().role:auth.token?.admin===true?'admin':'student';
 // Profesor e investigador solo valen con un correo @unipaz.edu.co verificado; si la cuenta deja de cumplirlo, actúa como estudiante.
 return staff(role)&&!institutionalToken(auth.token)?'student':role;
}
export const staff=r=>r==='teacher'||r==='researcher';
export const institutionalToken=token=>String(token?.email||'').toLowerCase().endsWith('@unipaz.edu.co')&&token?.email_verified===true;
export const owns=(species,uid)=>!!uid&&(species?.created_by===uid||species?.submitted_by===uid);
export async function requireRole(auth,allowed,tx){const role=await roleFor(auth,tx);if(!allowed.includes(role))fail('Tu rol no permite esta operación.','permission-denied');return role;}
