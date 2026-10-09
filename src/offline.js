import React, {useEffect, useState} from 'react';

const DB_NAME = 'flora-viva-public-offline';
const FIELDS = ['common_name','scientific_name','family','genus','order','synonyms','habit','description','morphology','ecology','uses','precautions','references','photo_credit'];
const h = React.createElement;

// Deliberate allowlist: never serialize a complete Firestore document.
export function publicSnapshot(plant) {
  if (!plant?.id || plant.is_published !== true) throw Error('Solo puedes guardar fichas públicas.');
  const result = {id: String(plant.id), is_published: true, is_demo: plant.is_demo === true};
  for (const key of FIELDS) result[key] = typeof plant[key] === 'string' ? plant[key] : '';
  return result;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(Error('Este navegador no permite guardar fichas en el dispositivo.'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('species', {keyPath: 'id'});
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(Error('No se pudo abrir el almacenamiento local.'));
    request.onblocked = () => reject(Error('Cierra otras pestañas de Flora Viva e inténtalo de nuevo.'));
  });
}

async function transaction(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('species', mode);
    const request = operation(tx.objectStore('species'));
    tx.oncomplete = () => {database.close(); resolve(request.result);};
    tx.onabort = tx.onerror = () => {database.close(); reject(Error('No se pudo guardar o leer la copia. Comprueba el espacio disponible y los permisos del navegador.'));};
  });
}

export async function listOfflineSpecies() {
  return (await transaction('readonly', store => store.getAll())).sort((a,b) => b.savedAt.localeCompare(a.savedAt));
}
export async function deleteOfflineSpecies(id) {
  await transaction('readwrite', store => store.delete(id));
}

export async function saveOfflineSpecies(plant) {
  publicSnapshot(plant);
  if (globalThis.navigator?.onLine === false) throw Error('Conéctate para guardar o actualizar esta ficha.');
  // Lazy imports keep the offline library independent of Firebase initialization.
  const [{db, storage}, firestore, media] = await Promise.all([
    import('./firebase'), import('firebase/firestore'), import('firebase/storage'),
  ]);
  const snapshot = await firestore.getDocFromServer(firestore.doc(db, 'species', String(plant.id)));
  if (!snapshot.exists()) throw Error('Esta ficha ya no está disponible.');
  const current = {...snapshot.data(), id: snapshot.id};
  const record = publicSnapshot(current);
  const photos = await firestore.getDocsFromServer(firestore.query(firestore.collection(db, 'photos'), firestore.where('species_id', '==', record.id), firestore.limit(100)));
  const sources = [];
  if (current.photo) sources.push({path: current.photo, caption: record.common_name, credit: record.photo_credit});
  for (const item of photos.docs.map(d => d.data()).sort((a,b) => (a.position || 0) - (b.position || 0))) {
    if (item.path && !sources.some(source => source.path === item.path)) sources.push({path: item.path, caption: String(item.caption || ''), credit: String(item.credit || '')});
  }
  record.photos = [];
  let bytes = 0;
  // Complete all downloads before replacing an existing snapshot: failures preserve it.
  for (const source of sources) {
    const photoRef = media.ref(storage, source.path);
    const metadata = await media.getMetadata(photoRef);
    if (!['image/jpeg','image/png','image/webp'].includes(metadata.contentType)) throw Error('Una fotografía tiene un formato no compatible. La copia anterior se conserva.');
    const downloaded = await media.getBlob(photoRef, 8 * 1024 * 1024);
    // Storage downloads can omit the Blob MIME type; preserve the validated metadata.
    const blob = downloaded.slice(0, downloaded.size, metadata.contentType);
    bytes += blob.size;
    if (bytes > 60 * 1024 * 1024) throw Error('Las fotografías superan 60 MB. No se ha reemplazado la copia anterior.');
    record.photos.push({blob, caption: source.caption, credit: source.credit});
  }
  record.savedAt = new Date().toISOString();
  await transaction('readwrite', store => store.put(record));
  // A persistence request may be declined; browser storage remains usable regardless.
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  return record;
}

export function SaveOffline({plant}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {setStatus(''); setFailed(false);}, [plant?.id]);
  if (plant?.is_published !== true) return null;
  async function save() {
    setBusy(true); setFailed(false); setStatus('Descargando ficha y fotografías…');
    try {const saved = await saveOfflineSpecies(plant); setStatus(`Ficha guardada con ${saved.photos.length} fotografías. Disponible en «Sin conexión».`);}
    catch (error) {setFailed(true); setStatus(error.message || 'No se pudo guardar la ficha.');}
    finally {setBusy(false);}
  }
  return h('div', {className: 'offline-save'},
    h('button', {type:'button', className:'button outline', disabled:busy, onClick:save}, busy ? 'Guardando…' : 'Guardar sin conexión'),
    h('p', {className:'muted'}, 'Guarda el texto y las fotografías en este dispositivo. Los modelos 3D requieren conexión.'),
    status && h('p', {role:failed ? 'alert' : 'status', className:failed ? 'notice error' : 'notice'}, status));
}

let installPrompt;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {event.preventDefault(); installPrompt = event; window.dispatchEvent(new Event('flora-install-ready'));});
  window.addEventListener('appinstalled', () => {installPrompt = undefined; window.dispatchEvent(new Event('flora-install-ready'));});
}

export function InstallApp() {
  const [available, setAvailable] = useState(Boolean(installPrompt));
  const [instructions, setInstructions] = useState(false);
  const [standalone, setStandalone] = useState(() => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true));
  useEffect(() => {
    const update = () => {setAvailable(Boolean(installPrompt)); setStandalone(window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true);};
    window.addEventListener('flora-install-ready', update);
    return () => window.removeEventListener('flora-install-ready', update);
  }, []);
  if (standalone) return null;
  async function install() {
    if (!installPrompt) {setInstructions(value => !value); return;}
    const prompt = installPrompt; installPrompt = undefined; setAvailable(false);
    try {await prompt.prompt(); await prompt.userChoice;} catch {setInstructions(true);}
  }
  return h('div', {className:'install-app'},
    h('button', {type:'button', className:'button outline small', onClick:install, 'aria-expanded':instructions}, available ? 'Instalar Flora Viva' : 'Cómo instalar'),
    instructions && h('p', {className:'notice', role:'status'}, /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'En Safari, toca Compartir → Añadir a pantalla de inicio. Abre la aplicación y guarda las fichas que quieras consultar sin conexión.' : 'Abre el menú del navegador y busca «Instalar aplicación» o «Añadir a pantalla de inicio». Si no aparece, sigue usando la web y guarda tus fichas desde cada especie.'));
}

export async function registerOfflineWorker() {
  if (!import.meta.env?.PROD || !('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {scope:'/', updateViaCache:'none'});
    registration.update().catch(() => {});
    return registration;
  } catch (error) {console.warn('La consulta sin conexión no se pudo activar.', error);}
}
