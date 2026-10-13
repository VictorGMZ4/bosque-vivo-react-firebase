import React,{useState} from 'react';

export function PlantImport({onImport,busy}){
 const [loading,setLoading]=useState(false),[error,setError]=useState('');
 async function read(event){
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  setError('');setLoading(true);
  try{
   if(file.size>5*1024*1024)throw Error('El archivo supera 5 MB. Usa una plantilla sin imágenes.');
   const {parsePlantFile}=await import('./species-import.js');
   const rows=parsePlantFile(file.name,new Uint8Array(await file.arrayBuffer()));onImport(rows);
  }catch(e){setError(e.message?.startsWith('invalid')?'No se pudo leer el archivo. Vuelve a guardarlo como .docx o .xlsx.':e.message||'No se pudo leer la plantilla.');}
  finally{setLoading(false);}
 }
 return <aside className="panel" aria-labelledby="plant-import-title">
  <h2 id="plant-import-title">Completar desde una plantilla</h2>
  <p>Descarga el formato, rellénalo y súbelo para revisar sus datos en este formulario. La carga no guarda ni publica especies.</p>
  <div className="actions"><a className="button outline" href="/templates/flora-viva-especie.docx" download>Descargar Word</a><a className="button outline" href="/templates/flora-viva-especies.xlsx" download>Descargar Excel</a></div>
  <p className="muted">Word: una ficha por documento. Excel: una especie por fila, hasta 100. Solo texto, sin fórmulas ni imágenes; máximo 5 MB.</p>
  <label>Subir plantilla rellenada<input type="file" accept=".docx,.xlsx" onChange={read} disabled={busy||loading}/></label>
  {loading&&<p role="status">Leyendo los datos…</p>}{error&&<p className="notice error" role="alert">{error}</p>}
 </aside>;
}
