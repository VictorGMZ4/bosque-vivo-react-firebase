const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('work/qa',{recursive:true});
 try{
  await page.goto('http://127.0.0.1:4174/');await page.waitForFunction(()=>document.querySelector('.welcome-model model-viewer')?.loaded,{},{timeout:60000});
  await page.getByRole('button',{name:'Girar automáticamente'}).click();assert(await page.locator('.welcome-model model-viewer').evaluate(e=>e.autoRotate));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('.welcome-model model-viewer').autoRotate);
  await page.getByRole('button',{name:'Pausar giro'}).click();
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`work/qa/welcome-${width}.png`,fullPage:false});}
  await page.goto('http://127.0.0.1:4174/especies/8/');await page.getByRole('button',{name:'Imprimir etiqueta QR'}).waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.species-qr-label img')].every(e=>e.complete&&e.naturalWidth>0));
  await page.evaluate(()=>{window.print=()=>window.printCalled=true;});await page.getByRole('button',{name:'Imprimir etiqueta QR'}).click();assert(await page.evaluate(()=>window.printCalled));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('.qr-share-section').screenshot({path:'work/qa/qr-mobile.png'});
  await page.emulateMedia({media:'print'});assert(await page.locator('#root').isHidden());assert(await page.locator('.qr-print-sheet').isVisible());
  await page.pdf({path:'work/qa/qr-label.pdf',preferCSSPageSize:true,printBackground:true});await page.setViewportSize({width:794,height:1123});await page.screenshot({path:'work/qa/qr-print.png'});
  await page.emulateMedia({media:'screen'});await page.route('**/models/welcome-plant.glb',route=>route.abort());await page.goto('http://127.0.0.1:4174/');await page.getByRole('button',{name:'Reintentar bienvenida 3D'}).waitFor({timeout:60000});assert(await page.locator('.welcome-poster').isVisible());
  await page.unroute('**/models/welcome-plant.glb');await page.getByRole('button',{name:'Reintentar bienvenida 3D'}).click();await page.waitForFunction(()=>document.querySelector('.welcome-model model-viewer')?.loaded,{},{timeout:60000});
  assert.deepEqual(errors,[]);console.log('PASS: 3D, rotation, reduced motion, responsive, QR print/PDF, failed-model retry; no page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
