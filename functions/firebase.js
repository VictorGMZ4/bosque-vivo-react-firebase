import {initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {getStorage} from 'firebase-admin/storage';
if(!getApps().length)initializeApp({projectId:process.env.GCLOUD_PROJECT||'demo-bosque-vivo',storageBucket:process.env.STORAGE_BUCKET||`${process.env.GCLOUD_PROJECT||'demo-bosque-vivo'}.firebasestorage.app`});
export const db=getFirestore(),authAdmin=getAuth(),bucket=getStorage().bucket();
