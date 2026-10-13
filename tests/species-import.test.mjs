import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DOMParser} from '@xmldom/xmldom';
import {zipSync,strToU8} from 'fflate';
import {parsePlantFile,normalizePlant} from '../src/species-import.js';
import {filledWord,filledExcel} from './plant-import-fixtures.mjs';
globalThis.DOMParser=DOMParser;
test('downloadable templates round-trip accented values and Word line breaks',()=>{
 const word=parsePlantFile('f.docx',filledWord());assert.equal(word[0].issues.length,0);assert.match(word[0].data.description,/\nSegunda línea/);
 const excel=parsePlantFile('f.xlsx',filledExcel());assert.equal(excel.length,2);assert.equal(excel[1].data.habit,'herb');assert.equal(excel[0].issues.length,0);
});
test('limits compressed file size and expanded archive size',()=>{
 assert.throws(()=>parsePlantFile('a.xlsx',new Uint8Array(5*1024*1024+1)),/5 MB/);
 assert.throws(()=>parsePlantFile('a.docx',zipSync({'word/document.xml':new Uint8Array(21*1024*1024)})),/demasiado grande/);
});
const archive=files=>zipSync(Object.fromEntries(Object.entries(files).map(([k,v])=>[k,strToU8(v)])));
const word=rows=>archive({'word/document.xml':`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:tbl>${rows.map(([a,b])=>`<w:tr><w:tc><w:p><w:r><w:t>${a}</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>${b}</w:t></w:r></w:p></w:tc></w:tr>`).join('')}</w:tbl></w:body></w:document>`});
test('Word maps only botanical fields and preserves accented text',()=>{
 const rows=parsePlantFile('ficha.docx',word([['Nombre común *','Arizá'],['Nombre científico *','Brownea sp.'],['Familia botánica *','Fabaceae'],['Tipo de planta','Árbol'],['admin','true']]));
 assert.equal(rows[0].data.common_name,'Arizá');assert.equal(rows[0].data.habit,'tree');assert.equal(rows[0].data.admin,undefined);
});
test('missing fields and invalid habits are reported without inventing data',()=>{
 const p=normalizePlant({'Nombre común':'Prueba','Tipo de planta':'musgo'});
 assert.equal(p.data.scientific_name,'');assert.equal(p.issues.length,3);
});
test('rejects obsolete extensions, corrupt archives and XML entities',()=>{
 assert.throws(()=>parsePlantFile('a.doc',new Uint8Array()));
 assert.throws(()=>parsePlantFile('a.docx',new Uint8Array([1,2])));
 assert.throws(()=>parsePlantFile('a.docx',archive({'word/document.xml':'<!DOCTYPE x [<!ENTITY a "test">]><x/>'})));
});
test('rejects duplicate Word fields and empty templates',()=>{
 assert.throws(()=>parsePlantFile('a.docx',word([['Nombre común','a'],['Nombre común','b']])));
 assert.throws(()=>parsePlantFile('a.docx',word([['Nombre común','']])));
});
test('Excel reads sparse inline cells, reports formulas, and keeps rows separate',()=>{
 const row=(n,cells)=>`<row r="${n}">${cells.map(([col,text,formula])=>`<c r="${col}${n}" t="inlineStr">${formula?'<f>1+1</f>':''}<is><t>${text}</t></is></c>`).join('')}</row>`;
 const bytes=archive({'xl/workbook.xml':'<workbook xmlns:r="r"><sheets><sheet name="Especies" r:id="rId1"/></sheets></workbook>','xl/_rels/workbook.xml.rels':'<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>','xl/worksheets/sheet1.xml':`<worksheet><sheetData>${row(1,[['A','Nombre común *'],['B','Nombre científico *'],['C','Familia botánica *'],['D','Tipo de planta']])}${row(2,[['A','Prueba'],['B','Prueba sp.'],['C','Familia'],['D','Árbol']])}${row(4,[['A','Otra'],['C','Familia',true]])}</sheetData></worksheet>`});
 const rows=parsePlantFile('a.xlsx',bytes);assert.equal(rows.length,2);assert.equal(rows[1].source,'Fila 4');assert.ok(rows[1].issues.some(x=>x.includes('fórmula')));assert.equal(rows[0].data.habit,'tree');
});
