// Local UI check with mocked authentication/callables; never writes to Firebase.
// Requires PLAYWRIGHT_MODULE pointing at the installed Playwright index.mjs.
import {pathToFileURL} from 'node:url';
import {mkdirSync} from 'node:fs';
import {filledWord,filledExcel} from '../tests/plant-import-fixtures.mjs';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({server:{host:'127.0.0.1',port:4189,strictPort:true}});
await server.listen();
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,channel:'msedge'});
mkdirSync('work/template-preview',{recursive:true});
try{
 const page=await browser.newPage();const calls=[];let failNext=true,role='admin';
 await page.route('**/src/auth.jsx*',r=>r.fulfill({contentType:'application/javascript',body:`export const roleLabels={admin:'Admin',teacher:'Profesor',student:'Estudiante'};export const useAuth=()=>({ready:true,user:{uid:'ui-test',displayName:'Prueba local'},role:'${role}',admin:${role==='admin'},teacher:${role==='teacher'}});export const AuthProvider=({children})=>children;`}));
 await page.route('**/demo-bosque-vivo/us-central1/mutate',async r=>{
  if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'}});
  calls.push(r.request().postDataJSON());
  await r.fulfill({status:failNext?400:200,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify(failNext?{error:{status:'INVALID_ARGUMENT',message:'Error simulado: datos conservados'}}:{result:{id:'ui-test'}})});failNext=false;
 });
 page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:4189/gestion/especies/nueva/');
 await page.getByLabel('Subir plantilla rellenada').setInputFiles({name:'filled.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:filledExcel()});
 await page.waitForFunction(()=>document.querySelector('[name="common_name"]')?.value==='Prueba de importación');
 assert.equal(await page.locator('[name="habit"]').inputValue(),'tree');
 assert.equal(calls.length,0);
 await page.getByRole('button',{name:'Guardar especie',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Error simulado'}).waitFor();
 assert.equal(await page.locator('[name="common_name"]').inputValue(),'Prueba de importación');
 await page.getByRole('button',{name:'Guardar especie',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[name="common_name"]')?.value==='Segunda prueba');
 assert.equal(calls.length,2);assert.equal(calls[1].data.data.is_published,false);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'work/template-preview/import-mobile.png',fullPage:true});
 await page.getByLabel('Subir plantilla rellenada').setInputFiles({name:'filled.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:filledWord()});
 await page.waitForFunction(()=>document.querySelector('[name="common_name"]')?.value==='Prueba de importación');
 assert.match(await page.locator('textarea[name="description"]').inputValue(),/\nSegunda línea/);
 role='teacher';let proposal;
 await page.route('**/demo-bosque-vivo/us-central1/workspace',async r=>{
  if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'}});
  if(r.request().postDataJSON().data.action==='draftSubmission')proposal=r.request().postDataJSON();await r.fulfill({headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify({result:{id:'ui-proposal'}})});
 });
 await page.goto('http://127.0.0.1:4189/propuestas/nueva/');
 await page.getByLabel('Subir plantilla rellenada').setInputFiles({name:'filled.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:filledExcel()});
 await page.waitForFunction(()=>document.querySelector('[name="common_name"]')?.value==='Prueba de importación');
 assert.equal(await page.getByLabel('Publicar en el catálogo').count(),0);
 await page.getByRole('button',{name:'Enviar a revisión',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[name="common_name"]')?.value==='Segunda prueba');
 assert.equal(proposal.data.action,'draftSubmission');assert.equal(proposal.data.data.is_published,false);
 role='student';await page.goto('http://127.0.0.1:4189/propuestas/nueva/');
 await page.getByRole('heading',{name:'Acceso restringido'}).waitFor();assert.equal(await page.getByLabel('Subir plantilla rellenada').count(),0);
 console.log('PASS: Office files fill form, upload does not save, failure retains data, successful save advances, mobile has no overflow. Firebase mocked.');
 console.log('PASS: teacher submits unpublished proposal; student cannot access importer. UI roles mocked, backend unchanged.');
}finally{await browser.close();await server.close();}

