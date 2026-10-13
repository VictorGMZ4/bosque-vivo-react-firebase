import {createServer} from 'vite';
import {pathToFileURL} from 'node:url';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const server=await createServer({server:{host:'127.0.0.1',port:4191,strictPort:true}});await server.listen();
const browser=await chromium.launch({channel:'msedge',headless:true});mkdirSync('work/gallery-preview',{recursive:true});
try{
 const page=await browser.newPage({hasTouch:true});
 await page.route('**/src/auth.jsx*',r=>r.fulfill({contentType:'application/javascript',body:`export const roleLabels={};export const useAuth=()=>({ready:true,user:null,admin:true,role:'student'});export const AuthProvider=({children})=>children;`}));
 await page.route('**/src/data.js*',r=>r.fulfill({contentType:'application/javascript',body:`const plant={id:'fixture',common_name:'Especie de prueba',scientific_name:'Testus exemplum',family:'Familia de prueba',habit:'tree',description:'Descripción sintética para comprobar la interfaz.',photo:'primary',photo_credit:'Crédito principal',model_3d:'species/fixture/models/test.glb',is_published:true};export const listSpecies=async()=>[plant];export const getSpecies=async()=>plant;export const related=async(name)=>name==='photos'?[{id:'a',path:'leaf',caption:'Hoja de prueba',credit:'Crédito hoja',position:0},{id:'b',path:'flower',caption:'Flor de prueba',credit:'Crédito flor',position:1}]:[];export const normalize=v=>String(v||'').toLowerCase();export const habits={tree:'Árbol'};`}));
 await page.route('**/src/media.jsx*',r=>r.fulfill({contentType:'application/javascript',body:`import React from '/node_modules/.vite/deps/react.js';export function StorageImage({path,alt,...props}){return React.createElement('img',{src:'/botanical.svg',alt,...props});}export const uploadPhoto=async()=>'';export const uploadModel=async()=>'';`}));
 await page.goto('http://127.0.0.1:4191/especies/fixture/');
 await page.getByRole('heading',{name:'Especie de prueba en 3D'}).waitFor();
 for(let i=0;i<3;i++){
  await page.getByRole('button',{name:'Eliminar fotografía',exact:true}).first().click();
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  assert.equal(await page.locator('#modelo-3d').count(),1,'One 3D section after each editor state change');
 }
 console.log('PASS: one model section after repeated detail edits');
}finally{await browser.close();await server.close();}
