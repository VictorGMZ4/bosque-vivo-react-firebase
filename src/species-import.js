import {unzipSync,strFromU8} from 'fflate';

export const plantFields=[
 ['common_name','Nombre común',140,true],['scientific_name','Nombre científico',180,true],
 ['family','Familia botánica',100,true],['genus','Género',100],['order','Orden',100],
 ['synonyms','Otros nombres',240],['habit','Tipo de planta',30,true],
 ['description','Descripción general',20000],['morphology','Características morfológicas',20000],
 ['ecology','Ecología y cultivo',20000],['uses','Propiedades y usos',20000],
 ['precautions','Precauciones',20000],['references','Fuentes y referencias',20000]
];
const key=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f*]/g,'').trim().toLowerCase();
const fields=new Map(plantFields.map(f=>[key(f[1]),f]));
const habits={arbol:'tree',arbusto:'shrub',herbacea:'herb',palmera:'palm',trepadora:'climber'};
export function normalizePlant(values){
 const data={},issues=[];
 for(const [name,label,max,required] of plantFields){
  const found=Object.entries(values).find(([k])=>key(k)===key(label));
  const value=String(found?.[1]??'').trim();data[name]=value;
  if(required&&!value)issues.push(`Completa «${label}».`);
  if(value.length>max)issues.push(`«${label}» supera ${max} caracteres; corrígelo en el documento.`);
  if(name==='habit'){data[name]=habits[key(value)]||'';if(value&&!data[name])issues.push('Tipo de planta no reconocido: elige Árbol, Arbusto, Herbácea, Palmera o Trepadora.');}
 }
 return {data,issues};
}
const elements=(node,name)=>Array.from(node.getElementsByTagName('*')).filter(n=>(n.localName||n.nodeName.split(':').pop())===name);
const children=(node,name)=>Array.from(node.childNodes).filter(n=>n.nodeType===1&&(n.localName||n.nodeName.split(':').pop())===name);
const textOf=node=>elements(node,'t').map(t=>t.textContent).join('');
function wordText(node){
 const name=node.localName||node.nodeName.split(':').pop();
 if(name==='t')return node.textContent;
 if(name==='br'||name==='cr')return '\n';
 if(name==='tab')return '\t';
 return Array.from(node.childNodes||[]).map(wordText).join('');
}
function xml(bytes){
 if(!bytes)throw Error('El archivo no contiene la estructura de la plantilla.');
 const source=strFromU8(bytes);
 if(/<!DOCTYPE|<!ENTITY/i.test(source))throw Error('El documento contiene declaraciones XML no admitidas.');
 const doc=new DOMParser().parseFromString(source,'application/xml');
 if(elements(doc,'parsererror').length)throw Error('El documento contiene XML dañado.');
 return doc;
}
export function parsePlantFile(filename,bytes){
 const ext=filename.split('.').pop().toLowerCase();
 if(!['docx','xlsx'].includes(ext))throw Error('Usa la plantilla .docx o .xlsx. No se admiten .doc, .xls ni archivos con macros.');
 if(bytes.byteLength>5*1024*1024)throw Error('El archivo supera 5 MB. Retira las imágenes y vuelve a intentarlo.');
 let total=0,count=0;
 const files=unzipSync(bytes,{filter:entry=>{
  total+=entry.originalSize;count++;
  if(total>20*1024*1024||count>1000)throw Error('El documento es demasiado grande para importarlo.');
  return /^(word\/document\.xml|xl\/.*\.xml|xl\/_rels\/workbook\.xml\.rels)$/.test(entry.name);
 }});
 const records=[];
 if(ext==='docx'){
  const doc=xml(files['word/document.xml']),values={};
  for(const row of elements(doc,'tr')){
   const cells=children(row,'tc');if(cells.length!==2)continue;
   const label=key(textOf(cells[0]));if(!fields.has(label))continue;
   if(Object.hasOwn(values,label))throw Error('La ficha Word tiene campos repetidos. Usa una sola especie por documento.');
   values[label]=elements(cells[1],'p').map(wordText).join('\n');
  }
  if(Object.values(values).some(v=>v.trim()))records.push({...normalizePlant(values),source:'Ficha Word'});
 }else{
  const book=xml(files['xl/workbook.xml']);
  const sheet=elements(book,'sheet').find(s=>s.getAttribute('name')==='Especies');
  if(!sheet)throw Error('No se encontró la hoja «Especies». Usa la plantilla de Flora Viva.');
  const rels=xml(files['xl/_rels/workbook.xml.rels']);
  const relation=elements(rels,'Relationship').find(r=>r.getAttribute('Id')===sheet.getAttribute('r:id'));
  const target=relation?.getAttribute('Target')||'';
  if(relation?.getAttribute('TargetMode')==='External'||target.includes('..'))throw Error('La hoja debe estar dentro del archivo.');
  const path=target.startsWith('/')?target.slice(1):'xl/'+target;
  const sheetDoc=xml(files[path]);
  const shared=files['xl/sharedStrings.xml']?elements(xml(files['xl/sharedStrings.xml']),'si').map(textOf):[];
  const rows=elements(sheetDoc,'row');const headers=new Map();
  for(const [i,row] of rows.entries()){
   const values={},issues=[];
   for(const cell of children(row,'c')){
    const col=(cell.getAttribute('r')||'').match(/^[A-Z]+/)?.[0];
    const raw=elements(cell,'v')[0]?.textContent||'';
    const value=cell.getAttribute('t')==='s'?(shared[Number(raw)]??''):cell.getAttribute('t')==='inlineStr'?textOf(cell):raw;
    if(i===0){const label=key(value);if(fields.has(label)){if([...headers.values()].includes(label))throw Error('Hay columnas repetidas en la plantilla.');headers.set(col,label);}continue;}
    const label=headers.get(col);if(!label)continue;
    if(elements(cell,'f').length){values[label]='';issues.push(`«${fields.get(label)[1]}» contiene una fórmula: escribe su valor como texto.`);}else values[label]=value;
   }
   if(i===0&&!headers.has('A'))throw Error('La primera fila debe contener los encabezados de la plantilla.');
   if(i>0&&(Object.values(values).some(v=>String(v).trim())||issues.length)){
    const record=normalizePlant(values);records.push({...record,issues:[...issues,...record.issues],source:`Fila ${row.getAttribute('r')||i+1}`});
   }
   if(records.length>100)throw Error('Importa como máximo 100 especies por archivo.');
  }
 }
 if(!records.length)throw Error('La plantilla está vacía o no contiene campos reconocibles.');
 return records;
}
