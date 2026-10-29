import {db,bucket} from './firebase.js';
import {requireRole} from './access.js';
const week=7*24*60*60*1000;
// Informe de solo lectura: no mueve ni elimina archivos. `now` solo se fija desde las pruebas.
export async function orphanReport(auth,now=Date.now()){
 await requireRole(auth,['admin']);
 const [species,photos,submissions,trash]=await Promise.all(['species','photos','submissions','trash'].map(name=>db.collection(name).get()));
 const used=new Set(),add=(...paths)=>paths.forEach(p=>typeof p==='string'&&p&&used.add(p)),record=r=>add(r?.photo,r?.model_3d,r?.legacy_photo,r?.legacy_model_3d);
 species.docs.forEach(d=>record(d.data()));photos.docs.forEach(d=>add(d.data().path));
 submissions.docs.forEach(d=>{const s=d.data();add(...(s.photos||[]).map(p=>p?.path),s.model?.path);});
 trash.docs.forEach(d=>{record(d.data().record);add(...(d.data().photos||[]).map(p=>p?.data?.path));});
 const owners={species:new Set([...species.docs,...trash.docs].map(d=>d.id)),submissions:new Set(submissions.docs.map(d=>d.id))};
 const report={scanned:0,referenced:0,recent:0,orphans:[],total_bytes:0};let query={autoPaginate:false,maxResults:1000};
 do{
  const [files,next]=await bucket.getFiles(query);
  for(const file of files){
   report.scanned++;if(used.has(file.name)){report.referenced++;continue;}
   const updated=Date.parse(file.metadata.updated||file.metadata.timeCreated)||0;if(now-updated<week){report.recent++;continue;}
   const size=Number(file.metadata.size)||0,[,folder,id]=file.name.match(/^(species|submissions)\/([^/]+)\/(photos|models)\/[^/]+$/)||[];report.total_bytes+=size;
   report.orphans.push({path:file.name,size,updated,reason:!folder?'Fuera de las carpetas conocidas':owners[folder].has(id)?'No referenciado':folder==='species'?'Especie inexistente':'Propuesta inexistente'});
  }
  query=next;
 }while(query);
 report.orphans.sort((a,b)=>a.path.localeCompare(b.path));return report;
}
