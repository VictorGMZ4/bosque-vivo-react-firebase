import {createServer} from 'vite';
import {pathToFileURL} from 'node:url';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const server=await createServer({server:{host:'127.0.0.1',port:4191,strictPort:true}});await server.listen();
const browser=await chromium.launch({channel:'msedge',headless:true});mkdirSync('work/gallery-preview',{recursive:true});
try{
 const page=await browser.newPage({hasTouch:true});
 await page.route('**/src/auth.jsx*',r=>r.fulfill({contentType:'application/javascript',body:`export const roleLabels={};export const useAuth=()=>({ready:true,user:null,admin:false,role:'student'});export const AuthProvider=({children})=>children;`}));
 await page.route('**/src/data.js*',r=>r.fulfill({contentType:'application/javascript',body:`const plant={id:'fixture',common_name:'Especie de prueba',scientific_name:'Testus exemplum',family:'Familia de prueba',habit:'tree',description:'Descripción sintética para comprobar la interfaz.',photo:'primary',photo_credit:'Crédito principal',is_published:true};export const listSpecies=async()=>[plant];export const getSpecies=async()=>plant;export const related=async(name)=>name==='photos'?[{id:'a',path:'leaf',caption:'Hoja de prueba',credit:'Crédito hoja',position:0},{id:'b',path:'flower',caption:'Flor de prueba',credit:'Crédito flor',position:1}]:[];export const normalize=v=>String(v||'').toLowerCase();export const habits={tree:'Árbol'};`}));
 await page.route('**/src/media.jsx*',r=>r.fulfill({contentType:'application/javascript',body:`import React from '/node_modules/.vite/deps/react.js';export function StorageImage({path,alt,...props}){return React.createElement('img',{src:'/botanical.svg',alt,...props});}export const uploadPhoto=async()=>'';export const uploadModel=async()=>'';`}));
 await page.goto('http://127.0.0.1:4191/catalogo/?q=prueba');
 const quick=page.getByRole('button',{name:'Vista rápida de Especie de prueba'});await quick.click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();assert.match(await dialog.innerText(),/Testus exemplum/);assert.match(await dialog.innerText(),/Crédito principal/);
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('dialog')),true);await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert.equal(await quick.evaluate(n=>n===document.activeElement),true);assert.ok(page.url().includes('q=prueba'));
 await quick.click();await page.waitForTimeout(250);await page.screenshot({path:'work/gallery-preview/quick-desktop.png'});await page.getByRole('link',{name:'Ver ficha completa',exact:true}).click();await page.waitForURL('**/especies/fixture/');
 assert.equal(await page.locator('.detail-gallery').count(),0);
 assert.equal(await page.getByRole('heading',{name:'Detalles que cuentan'}).count(),0);
 console.log('PASS: quick view, preserved search, restored focus, full detail; public detail gallery removed. Synthetic fixture.');
}finally{await browser.close();await server.close();}
