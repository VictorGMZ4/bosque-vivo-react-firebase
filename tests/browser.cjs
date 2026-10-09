const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base='http://127.0.0.1:4174';
const access=JSON.parse(fs.readFileSync('work/local-access.json','utf8'));
process.env.GCLOUD_PROJECT='demo-bosque-vivo';process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8080';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[],checks=[],fixtures=[];const {db}=await import('../functions/firebase.js');
 page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('work/qa',{recursive:true});
 try{
  await page.goto(base+'/catalogo/');await page.locator('.plant-card').first().waitFor();
  const expected=JSON.parse(fs.readFileSync('work/import/data.json','utf8')).species.filter(s=>s.is_published).length;
  await page.getByRole('status').filter({hasText:`${expected} especies encontradas`}).waitFor();
  for(const width of [375,390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`work/qa/catalog-${width}.png`,fullPage:true});}
  await page.getByLabel('Buscar una especie').fill('ninguna-QA-zzz');await page.getByText('No encontramos especies con esos filtros.').waitFor();await page.getByRole('button',{name:'Limpiar filtros'}).click();
  await page.getByLabel('Buscar una especie').fill('Girasol');await page.locator('.plant-card').first().waitFor();assert.equal(await page.locator('.plant-card').count(),1);await page.getByRole('button',{name:'Limpiar filtros'}).click();
  checks.push('catálogo importado; búsqueda y limpieza; 375/390/768/1440 px');
  for(let i=0;i<10;i++){const id='qa-page-'+Date.now()+'-'+i;fixtures.push(id);await db.collection('species').doc(id).set({common_name:'QA Paginación '+i,scientific_name:'QA taxon '+id,family:'QA paginación',habit:'herb',is_published:true,is_demo:true,photo:''});}
  await page.reload();await page.getByRole('status').filter({hasText:`${expected+10} especies encontradas`}).waitFor();assert.equal(await page.locator('.plant-card').count(),9);await page.getByRole('button',{name:'Siguiente',exact:true}).click();await page.getByText('Página 2 de 2',{exact:true}).waitFor();assert.equal(await page.locator('.plant-card').count(),expected+1);
  await page.getByRole('combobox',{name:/^Familia/}).selectOption('QA paginación');await page.getByText('Página 1 de 2',{exact:true}).waitFor();assert.equal(await page.locator('.plant-card').count(),9);await page.getByRole('combobox',{name:/^Tipo de planta/}).selectOption('tree');await page.getByText('No encontramos especies con esos filtros.').waitFor();
  for(const id of fixtures)await db.collection('species').doc(id).delete();fixtures.length=0;
  checks.push('paginación de nueve fichas y filtros por familia/tipo con fixtures retirados');
  await page.goto(base+'/gestion/');await page.getByRole('heading',{name:'Acceso restringido'}).waitFor();checks.push('administración cerrada a visitantes');
  await page.goto(base+'/ingresar/');await page.getByLabel('Correo electrónico').fill(access.email);await page.getByLabel('Contraseña',{exact:true}).fill(access.password);await page.getByRole('button',{name:'Ingresar',exact:true}).click();await page.getByRole('link',{name:'Administración',exact:true}).click();await page.getByRole('heading',{name:'Gestión de especies'}).waitFor();
  await page.screenshot({path:'work/qa/admin-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'work/qa/admin-mobile.png',fullPage:true});
  checks.push('inicio de sesión y dashboard adaptativo');
  const scientific='QA browser '+Date.now();let id;
  await page.getByRole('link',{name:'Registrar especie',exact:true}).click();await page.getByLabel('Nombre común *',{exact:true}).fill('QA Flora React');await page.getByLabel('Nombre científico *',{exact:true}).fill(scientific);await page.getByLabel('Familia botánica *',{exact:true}).fill('QA');await page.getByLabel('Publicar en el catálogo').check();await page.getByRole('button',{name:'Guardar especie',exact:true}).click();await page.getByRole('heading',{name:'QA Flora React',exact:true}).waitFor();id=new URL(page.url()).pathname.split('/')[2];
  await page.reload();await page.getByRole('heading',{name:'QA Flora React',exact:true}).waitFor();checks.push('creación de especie persiste tras recarga');
  await page.getByRole('link',{name:'Editar ficha',exact:true}).click();await page.getByLabel('Nombre común *',{exact:true}).fill('QA Flora Actualizada');await page.getByRole('button',{name:'Guardar especie',exact:true}).click();await page.getByRole('heading',{name:'QA Flora Actualizada',exact:true}).waitFor();checks.push('edición de especie');
  await page.getByRole('link',{name:'Registrar ejemplar',exact:true}).click();await page.getByLabel('Código *',{exact:true}).fill('QA-'+Date.now());await page.getByLabel('Zona del campus *',{exact:true}).fill('Zona de prueba local');await page.getByLabel('Altura observada (m)',{exact:true}).fill('2.5');await page.getByRole('button',{name:'Guardar ejemplar'}).click();await page.getByRole('heading',{name:'Zona de prueba local'}).waitFor();
  await page.getByRole('link',{name:'Editar ejemplar'}).click();await page.getByLabel('Zona del campus *',{exact:true}).fill('Zona QA editada');await page.getByRole('button',{name:'Guardar ejemplar'}).click();await page.getByRole('heading',{name:'Zona QA editada'}).waitFor();checks.push('creación y edición de ejemplar');
  await page.getByRole('link',{name:'Eliminar especie',exact:true}).click();await page.getByRole('button',{name:'Confirmar eliminación'}).click();await page.getByRole('alert').filter({hasText:'ejemplares'}).waitFor();await page.getByRole('link',{name:'Cancelar',exact:true}).click();checks.push('borrado de especie con ejemplares bloqueado en servidor');
  await page.getByText('Añadir fotografía',{exact:true}).click();const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jX1sAAAAASUVORK5CYII=','base64');await page.getByLabel('Archivo JPG, PNG o WebP').setInputFiles({name:'qa.png',mimeType:'image/png',buffer:image});await page.getByLabel('Descripción',{exact:true}).fill('Foto QA local');await page.getByLabel('Autor y licencia',{exact:true}).fill('Prueba sin contenido científico');await page.getByRole('button',{name:'Subir fotografía'}).click();await page.locator('.gallery-card').waitFor();
  await page.waitForFunction(()=>document.querySelector('.gallery-card img')?.src.startsWith('blob:'));
  await page.locator('.gallery-card').getByLabel('Descripción',{exact:true}).fill('Foto QA editada');await page.getByRole('button',{name:'Guardar fotografía'}).click();await page.locator('.gallery-card input[name="caption"]').filter({visible:true}).waitFor();
  checks.push('carga a Storage, renderizado y edición de foto');
  await page.getByRole('button',{name:'Eliminar fotografía'}).click();await page.getByRole('button',{name:'Confirmar eliminación'}).click();await page.getByText('Todavía no hay fotografías adicionales.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Eliminar ejemplar'}).click();await page.getByRole('button',{name:'Confirmar eliminación'}).click();await page.getByText('Aún no hay ejemplares documentados.',{exact:true}).waitFor();
  await page.getByRole('link',{name:'Editar ficha',exact:true}).click();await page.getByLabel('Publicar en el catálogo').uncheck();await page.getByRole('button',{name:'Guardar especie',exact:true}).click();await page.getByText('Borrador · Solo visible para el equipo administrador.').waitFor();
  const visitor=await browser.newContext();const other=await visitor.newPage();await other.goto(base+'/especies/'+id+'/');await other.getByRole('alert').waitFor();assert.equal(await other.getByRole('heading',{name:'QA Flora Actualizada'}).count(),0);await visitor.close();checks.push('borrador oculto en un contexto visitante nuevo');
  await page.getByRole('link',{name:'Eliminar especie',exact:true}).click();await page.getByRole('button',{name:'Confirmar eliminación'}).click();await page.getByRole('heading',{name:'Gestión de especies'}).waitFor();checks.push('eliminación completa de foto, ejemplar y especie');
  await page.getByRole('button',{name:'Cerrar sesión'}).click();await page.getByRole('heading',{name:'Acceso restringido'}).waitFor();checks.push('cierre de sesión retira acceso administrativo');
  assert.deepEqual(errors,[]);fs.writeFileSync('work/qa/browser-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
 }finally{for(const id of fixtures)await db.collection('species').doc(id).delete();await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

