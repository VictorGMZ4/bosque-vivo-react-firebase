import {createServer} from 'vite';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
mkdirSync('work/transition-preview',{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const server=await createServer({server:{host:'127.0.0.1',port:4190,strictPort:true}});await server.listen();
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4190/');
 assert.equal(await page.locator('#coleccion').count(),0);
 const link=page.getByRole('link',{name:'Explorar la colección'});assert.equal(await link.getAttribute('href'),'/catalogo/');
 await page.screenshot({path:'work/transition-preview/welcome.png'});await link.click();await page.locator('.collection-transition--depart').waitFor();assert.equal(await page.locator('.leaf-transition').count(),0);await page.waitForTimeout(140);await page.screenshot({path:'work/transition-preview/leaves.png'});await page.waitForURL('**/catalogo/');await page.locator('#coleccion').waitFor();await page.locator('.campus-route-bridge').waitFor({state:'detached'});
 await page.goBack();await page.getByRole('heading',{name:/Conocer nuestra flora/}).waitFor();assert.equal(await page.locator('.campus-copy.is-leaving').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('link',{name:'Explorar la colección'}).click();await page.waitForURL('**/catalogo/');assert.equal(await page.locator('.leaf-transition').count(),0);
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4190/');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('PASS: separate pages, campus zoom transition, navigation and cleanup, Back, reduced motion, mobile overflow');
}finally{await browser.close();await server.close();}
