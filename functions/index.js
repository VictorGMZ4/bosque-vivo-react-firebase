import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {mutateData} from './service.js';
import {requireAdmin,DomainError} from './domain.js';
import {workspaceAction} from './workspace.js';
export const mutate=onCall({region:'us-central1',maxInstances:3},async request=>{
 try{return await mutateData(request.auth,request.data);}
 catch(error){if(error instanceof DomainError)throw new HttpsError(error.code,error.message);console.error('Mutation failed',error.code||'internal');throw new HttpsError('internal','No se pudo guardar. Vuelve a intentarlo.');}
});
export const workspace=onCall({region:'us-central1',maxInstances:3},async request=>{
 try{return await workspaceAction(request.auth,request.data);}
 catch(error){if(error instanceof DomainError)throw new HttpsError(error.code,error.message);console.error('Workspace failed',error.code||'internal');throw new HttpsError('internal','No se pudo completar la operación.');}
});
