import {start,finish} from './loading';
import {initializeApp} from 'firebase/app';
import {getAuth,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';
import {getFunctions,connectFunctionsEmulator,httpsCallable} from 'firebase/functions';
import {getStorage,connectStorageEmulator} from 'firebase/storage';
export const local=import.meta.env.VITE_USE_EMULATORS!=='false';
const projectId=local?'demo-bosque-vivo':import.meta.env.VITE_FIREBASE_PROJECT_ID;
if(!local&&(!projectId||projectId.startsWith('demo-')||!import.meta.env.VITE_FIREBASE_API_KEY||!import.meta.env.VITE_FIREBASE_APP_ID))throw Error('Configuración Firebase productiva incompleta. Usa los emuladores para la prueba local.');
const app=initializeApp({projectId,apiKey:local?'demo-key':import.meta.env.VITE_FIREBASE_API_KEY,authDomain:local?'localhost':import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,storageBucket:local?'demo-bosque-vivo.firebasestorage.app':import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,appId:local?'demo-flora-viva':import.meta.env.VITE_FIREBASE_APP_ID});
export const auth=getAuth(app),db=getFirestore(app),functions=getFunctions(app,'us-central1'),storage=getStorage(app);
if(local){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080);connectFunctionsEmulator(functions,'127.0.0.1',5001);connectStorageEmulator(storage,'127.0.0.1',9199);}
export async function mutate(data){start();try{return (await httpsCallable(functions,'mutate')(data)).data;}finally{finish();}}
export async function workspace(data){start();try{return (await httpsCallable(functions,'workspace')(data)).data;}finally{finish();}}
export const personLabel=p=>p?.name&&p?.email?`${p.name} (${p.email})`:p?.name||p?.email||'Cuenta no disponible';
export {blockedMessage,messageFor} from './errors';
