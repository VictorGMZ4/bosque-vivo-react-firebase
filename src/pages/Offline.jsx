import React, {useEffect, useState} from 'react';
import {deleteOfflineSpecies, InstallApp, listOfflineSpecies} from '../offline';

function LocalPhoto({photo}) {
  const [url, setUrl] = useState('');
  useEffect(() => {const object = URL.createObjectURL(photo.blob); setUrl(object); return () => URL.revokeObjectURL(object);}, [photo.blob]);
  return <figure className="gallery-card"><img src={url || '/botanical.svg'} alt={photo.caption || 'Fotografía de la especie guardada'} loading="lazy"/><figcaption>{photo.caption}{photo.credit && <p className="muted">Fotografía: {photo.credit}</p>}</figcaption></figure>;
}

export function Offline() {
  const [records, setRecords] = useState([]), [selected, setSelected] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [confirm, setConfirm] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    let alive = true;
    listOfflineSpecies().then(items => {if (alive) setRecords(items);}).catch(e => {if (alive) setError(e.message);}).finally(() => {if (alive) setLoading(false);});
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => {alive = false; window.removeEventListener('online', update); window.removeEventListener('offline', update);};
  }, []);
  async function remove(id) {
    try {await deleteOfflineSpecies(id); setRecords(items => items.filter(item => item.id !== id)); setSelected(null); setConfirm(null);}
    catch (e) {setError(e.message);}
  }
  const plant = records.find(item => item.id === selected);
  return <section className="offline-library">
    <p className="eyebrow">TU CUADERNO DE CAMPO · FLORA VIVA</p><h1>Sin conexión</h1>
    <p>Fichas públicas que guardaste en este dispositivo. {online ? 'Tienes conexión a internet.' : 'Estás consultando tus copias sin internet.'}</p>
    <p className="notice">Estas copias pueden estar desactualizadas y no se sincronizan automáticamente. Guarda de nuevo la ficha original para actualizarla. Los modelos 3D requieren conexión. El navegador puede eliminar las copias si borras sus datos o necesita espacio.</p>
    <div className="actions"><a className="button outline" href="/catalogo/">Volver a la colección</a><InstallApp/></div>
    {error && <p role="alert" className="notice error">{error}</p>}
    {loading ? <p role="status">Leyendo fichas del dispositivo…</p> : !records.length ? <div className="empty"><h2>Tu cuaderno está listo para explorar.</h2><p>Con conexión, abre una especie pública y pulsa «Guardar sin conexión». Se descargarán su texto y fotografías.</p></div> : !plant ? <div className="specimen-grid">{records.map(item => <article className="panel" key={item.id}><p className="eyebrow">{item.family}</p><h2>{item.common_name}</h2><p className="latin">{item.scientific_name}</p><p className="muted">Guardada: <time dateTime={item.savedAt}>{new Date(item.savedAt).toLocaleString('es-CO')}</time> · {item.photos.length} fotografías</p><div className="actions"><button className="button" onClick={() => setSelected(item.id)}>Leer ficha guardada</button><button className="quiet danger-text" onClick={() => setConfirm(item.id)}>Eliminar copia</button></div>{confirm === item.id && <div className="notice"><p>¿Eliminar la copia de {item.common_name} de este dispositivo?</p><div className="actions"><button className="button danger" onClick={() => remove(item.id)}>Sí, eliminar copia</button><button className="button outline" onClick={() => setConfirm(null)}>Conservar</button></div></div>}</article>)}</div> : <article className="subsection">
      <button className="quiet back" onClick={() => setSelected(null)}>← Todas las fichas guardadas</button>
      {plant.is_demo && <p className="notice">Registro de demostración. No acredita presencia ni validación botánica.</p>}
      <p className="eyebrow">{plant.family}</p><h2>{plant.common_name}</h2><p className="latin large">{plant.scientific_name}</p><p className="muted">Copia del <time dateTime={plant.savedAt}>{new Date(plant.savedAt).toLocaleString('es-CO')}</time></p>
      <dl className="taxonomy">{[['Familia',plant.family],['Género',plant.genus],['Orden',plant.order],['Otros nombres',plant.synonyms]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Sin registrar'}</dd></div>)}</dl>
      <div className="information">{[['Descripción',plant.description],['Características morfológicas',plant.morphology],['Ecología y cultivo',plant.ecology],['Propiedades y usos',plant.uses],['Precauciones',plant.precautions],['Fuentes y referencias',plant.references]].map(([label,value]) => <article key={label}><h3>{label}</h3><p className="preserve">{value || 'Información pendiente de documentación.'}</p></article>)}</div>
      <h3>Fotografías guardadas</h3><div className="gallery-grid">{plant.photos.map((photo,index) => <LocalPhoto photo={photo} key={index}/>)}</div>{!plant.photos.length && <p>No había fotografías disponibles al guardar esta ficha.</p>}
      {online && <a className="button outline" href={`/especies/${encodeURIComponent(plant.id)}/`}>Abrir ficha original para actualizar</a>}
    </article>}
  </section>;
}
