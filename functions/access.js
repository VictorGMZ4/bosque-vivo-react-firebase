import {db} from './firebase.js';
import {fail} from './domain.js';
export const roles=['student','teacher','admin'];
export async function roleFor(auth,tx){
 if(!auth)fail('Inicia sesión para continuar.','unauthenticated');
 const ref=db.collection('roles').doc(auth.uid),snapshot=tx?await tx.get(ref):await ref.get();
 if(snapshot.data()?.disabled===true)fail('Tu cuenta está bloqueada. Contacta con la administración.','permission-denied');
 return snapshot.exists?snapshot.data().role:auth.token?.admin===true?'admin':'student';
}
export async function requireRole(auth,allowed,tx){const role=await roleFor(auth,tx);if(!allowed.includes(role))fail('Tu rol no permite esta operación.','permission-denied');return role;}
