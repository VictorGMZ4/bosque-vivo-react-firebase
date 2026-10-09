export async function validateModelFile(file){
 if(!file||!file.name.toLowerCase().endsWith('.glb')||file.size>30*1024*1024||file.size<20)throw Error('Selecciona un GLB autocontenido de hasta 30 MB.');
 const bytes=await file.arrayBuffer(),view=new DataView(bytes);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.byteLength||view.getUint32(16,true)!==0x4e4f534a||20+view.getUint32(12,true)>bytes.byteLength)throw Error('El archivo no es un modelo GLB válido.');
 let model;try{model=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,view.getUint32(12,true))));}catch{throw Error('El contenido del GLB no es válido.');}
 if([...(model.buffers||[]),...(model.images||[])].some(item=>item.uri&&!item.uri.startsWith('data:')))throw Error('El GLB debe incluir sus recursos; no se permiten archivos externos.');
 return file;
}
