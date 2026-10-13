import {readFileSync} from 'node:fs';
import {unzipSync,zipSync,strFromU8,strToU8} from 'fflate';
import {DOMParser,XMLSerializer} from '@xmldom/xmldom';
// Synthetic data only. Fill copies of the actual downloadable templates.
export function filledWord(){
 const files=unzipSync(readFileSync(new URL('../public/templates/flora-viva-especie.docx',import.meta.url)));
 const doc=new DOMParser().parseFromString(strFromU8(files['word/document.xml']),'application/xml');
 const values={'Nombre común *':'Prueba de importación','Nombre científico *':'Testus exemplum','Familia botánica *':'Familia de prueba','Tipo de planta *':'Árbol','Descripción general':'Descripción de prueba.\nSegunda línea.'};
 for(const row of Array.from(doc.getElementsByTagName('w:tr'))){
  const cells=row.getElementsByTagName('w:tc');const value=values[cells[0].textContent];if(!value)continue;
  const p=cells[1].getElementsByTagName('w:p')[0];
  value.split('\n').forEach((line,i)=>{const run=doc.createElement('w:r');if(i)run.appendChild(doc.createElement('w:br'));const t=doc.createElement('w:t');t.appendChild(doc.createTextNode(line));run.appendChild(t);p.appendChild(run);});
 }
 files['word/document.xml']=strToU8(new XMLSerializer().serializeToString(doc));return Buffer.from(zipSync(files));
}
export function filledExcel(){
 const files=unzipSync(readFileSync(new URL('../public/templates/flora-viva-especies.xlsx',import.meta.url)));
 let source=strFromU8(files['xl/worksheets/sheet1.xml']);
 const row=(n,values)=>`<row r="${n}">${values.map(([col,value])=>`<c r="${col}${n}" t="inlineStr"><is><t>${value}</t></is></c>`).join('')}</row>`;
 source=source.replace(/<row r="2"[\s\S]*?<\/row>/,row(2,[['A','Prueba de importación'],['B','Testus exemplum'],['C','Familia de prueba'],['G','Árbol']]));
 source=source.replace(/<row r="3"[\s\S]*?<\/row>/,row(3,[['A','Segunda prueba'],['B','Testus secundus'],['C','Familia de prueba'],['G','Herbácea']]));
 files['xl/worksheets/sheet1.xml']=strToU8(source);return Buffer.from(zipSync(files));
}
