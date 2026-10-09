import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {collection,getDocs,query,where,limit} from 'firebase/firestore';
import {db,workspace,messageFor} from '../firebase';
import {useAuth} from '../auth';
import {Guard} from './Community';

const newQuestion=()=>({prompt:'',options:['',''],correctIndex:0,explanation:'',speciesId:''});
const newQuiz=()=>({title:'',description:'',published:false,questions:[newQuestion()]});

export function Learning(){const {user}=useAuth();return <Guard><LearningContent key={user?.uid}/></Guard>;}
function LearningContent(){
 const {role}=useAuth(),canCreate=['teacher','admin'].includes(role);
 const [quizzes,setQuizzes]=useState([]),[attempts,setAttempts]=useState([]),[species,setSpecies]=useState([]);
 const [editor,setEditor]=useState(null),[active,setActive]=useState(null),[answers,setAnswers]=useState([]),[attemptId,setAttemptId]=useState(''),[result,setResult]=useState(null);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function refresh(){const [list,history]=await Promise.all([workspace({action:'learningList'}),workspace({action:'learningResults'})]);setQuizzes(list.quizzes);setAttempts(history.attempts);}
 useEffect(()=>{let alive=true;setLoading(true);Promise.all([workspace({action:'learningList'}),workspace({action:'learningResults'}),canCreate?getDocs(query(collection(db,'species'),where('is_published','==',true),limit(500))):Promise.resolve(null)]).then(([list,history,plants])=>{if(!alive)return;setQuizzes(list.quizzes);setAttempts(history.attempts);setSpecies(plants?plants.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.common_name.localeCompare(b.common_name,'es')):[]);}).catch(e=>alive&&setError(messageFor(e))).finally(()=>alive&&setLoading(false));return()=>{alive=false;};},[canCreate]);
 async function openQuiz(id,edit=false){setBusy(true);setError('');setNotice('');try{const {quiz}=await workspace({action:'learningGet',id});setResult(null);if(edit){setEditor(quiz);setActive(null);}else{setActive(quiz);setAnswers(quiz.questions.map(()=>null));setAttemptId(crypto.randomUUID());setEditor(null);}}catch(e){setError(messageFor(e));}finally{setBusy(false);}}
 async function save(e){e.preventDefault();setBusy(true);setError('');setNotice('');try{await workspace({action:'learningSave',...(editor.id?{id:editor.id,version:editor.version}:{}),data:{title:editor.title,description:editor.description,published:editor.published,questions:editor.questions}});setEditor(null);setNotice('Cuestionario guardado. Los resultados anteriores conservan su versión original.');await refresh();}catch(e){setError(messageFor(e));}finally{setBusy(false);}}
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{const response=await workspace({action:'learningSubmit',id:active.id,version:active.version,attemptId,answers});setResult(response.attempt);setActive(null);await refresh();}catch(e){setError(messageFor(e));}finally{setBusy(false);}}
 function updateQuestion(index,patch){setEditor(current=>({...current,questions:current.questions.map((q,i)=>i===index?{...q,...patch}:q)}));}
 return <section className="space-y-8">
  <div className="section-title"><div><p className="eyebrow">Aula botánica</p><h1>Aprender a reconocer</h1><p className="max-w-2xl">Pon a prueba tu conocimiento de las especies. Responde a tu ritmo, descubre la explicación y sigue tu progreso.</p></div>{canCreate&&!editor&&!active&&<button className="button" disabled={busy||loading} onClick={()=>{setEditor(newQuiz());setResult(null);setError('');setNotice('');}}>Crear cuestionario</button>}</div>
  {error&&<div className="notice error" role="alert">{error}</div>}{notice&&<p className="notice" role="status">{notice}</p>}
  {loading?<p role="status">Preparando el aula botánica…</p>:<>
   {editor&&<form className="panel space-y-6" onSubmit={save}>
    <div className="section-title"><div><h2>{editor.id?'Editar cuestionario':'Nuevo cuestionario'}</h2><p className="muted">De 1 a 10 preguntas, con una respuesta correcta por pregunta.</p></div><button className="button outline" type="button" disabled={busy} onClick={()=>setEditor(null)}>Cerrar editor</button></div>
    <fieldset disabled={busy} className="space-y-5 border-0 p-0">
     <label>Título<input required maxLength={160} value={editor.title} onChange={e=>setEditor({...editor,title:e.target.value})} placeholder="Por ejemplo: árboles del campus"/></label>
     <label>Introducción<textarea maxLength={1000} value={editor.description} onChange={e=>setEditor({...editor,description:e.target.value})} placeholder="¿Qué aprenderá el estudiante?"/></label>
     {editor.questions.map((q,index)=><fieldset key={index} className="rounded-2xl border border-emerald-900/15 bg-emerald-50/30 p-4 sm:p-6 space-y-4">
      <legend className="px-2 font-semibold">Pregunta {index+1}</legend>
      <label>Enunciado<textarea required maxLength={1000} value={q.prompt} onChange={e=>updateQuestion(index,{prompt:e.target.value})} placeholder="Describe la hoja, la flor o el fruto que permite identificarla."/></label>
      <div className="grid gap-4 sm:grid-cols-2">{q.options.map((option,oi)=><label key={oi}>Opción {String.fromCharCode(65+oi)}<input required maxLength={240} value={option} onChange={e=>updateQuestion(index,{options:q.options.map((o,i)=>i===oi?e.target.value:o)})}/></label>)}</div>
      <div className="actions"><button className="button outline small" type="button" disabled={q.options.length===4} onClick={()=>updateQuestion(index,{options:[...q.options,'']})}>Añadir opción</button><button className="button outline small" type="button" disabled={q.options.length===2} onClick={()=>updateQuestion(index,{options:q.options.slice(0,-1),correctIndex:Math.min(q.correctIndex,q.options.length-2)})}>Quitar última opción</button></div>
      <label>Respuesta correcta<select value={q.correctIndex} onChange={e=>updateQuestion(index,{correctIndex:Number(e.target.value)})}>{q.options.map((o,oi)=><option key={oi} value={oi}>Opción {String.fromCharCode(65+oi)}{o?`: ${o}`:''}</option>)}</select></label>
      <label>Explicación para después de responder<textarea maxLength={1000} value={q.explanation} onChange={e=>updateQuestion(index,{explanation:e.target.value})}/></label>
      <label>Ficha para ampliar el aprendizaje (opcional)<select value={q.speciesId} onChange={e=>updateQuestion(index,{speciesId:e.target.value})}><option value="">Sin ficha vinculada</option>{q.speciesId&&!species.some(s=>s.id===q.speciesId)&&<option value={q.speciesId}>Especie no disponible; selecciona otra</option>}{species.map(s=><option value={s.id} key={s.id}>{s.common_name} · {s.scientific_name}</option>)}</select></label>
      <button className="button outline small" type="button" disabled={editor.questions.length===1} onClick={()=>setEditor({...editor,questions:editor.questions.filter((_,i)=>i!==index)})}>Eliminar pregunta {index+1}</button>
     </fieldset>)}
     <button className="button outline" type="button" disabled={editor.questions.length===10} onClick={()=>setEditor({...editor,questions:[...editor.questions,newQuestion()]})}>Añadir pregunta ({editor.questions.length}/10)</button>
     <label>Visibilidad<select value={editor.published?'published':'draft'} onChange={e=>setEditor({...editor,published:e.target.value==='published'})}><option value="draft">Borrador: solo autor y administradores</option><option value="published">Publicado: disponible para estudiantes</option></select></label>
     <button className="button" type="submit">{busy?'Guardando…':editor.published?'Guardar y publicar':'Guardar borrador'}</button>
    </fieldset>
   </form>}
   {active&&<form className="panel space-y-6" onSubmit={submit}>
    <div className="section-title"><div><p className="eyebrow">Cuestionario · versión {active.version}</p><h2>{active.title}</h2><p>{active.description}</p></div><button type="button" className="button outline" disabled={busy} onClick={()=>setActive(null)}>Volver al aula</button></div>
    <p className="muted" aria-live="polite">{answers.filter(a=>a!==null).length} de {active.questions.length} preguntas respondidas</p>
    {active.questions.map((q,index)=><fieldset key={index} disabled={busy} className="space-y-3 rounded-2xl border border-emerald-900/15 p-4 sm:p-6"><legend className="max-w-full px-2 font-semibold">{index+1}. {q.prompt}</legend>{q.options.map((option,oi)=><label key={oi} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 ${answers[index]===oi?'border-emerald-700 bg-emerald-50':'border-emerald-900/10'}`}><input className="!w-auto shrink-0" type="radio" name={`answer-${index}`} value={oi} checked={answers[index]===oi} required onChange={()=>setAnswers(answers.map((a,i)=>i===index?oi:a))}/><span>{option}</span></label>)}</fieldset>)}
    <button className="button" type="submit" disabled={busy||answers.some(a=>a===null)}>{busy?'Guardando tu resultado…':'Enviar respuestas y ver resultado'}</button>
   </form>}
   {result&&<article className="panel space-y-5" aria-label="Detalle del resultado">
    <div className="section-title"><div><p className="eyebrow">Tu resultado · versión {result.version}</p><h2>{result.title}</h2></div><button className="button outline" onClick={()=>setResult(null)}>Cerrar resultado</button></div>
    <p className="text-3xl font-semibold text-emerald-900">{result.score} / {result.total} <span className="text-base font-normal">respuestas correctas · {Math.round(result.score/result.total*100)}%</span></p>
    <p className="muted">{new Date(result.submittedAt).toLocaleString('es-CO')} · Puedes volver a intentarlo cuando quieras.</p>
    {result.questions.map((q,i)=><div className="border-t border-emerald-900/10 pt-4" key={i}><h3>{i+1}. {q.prompt}</h3><p><strong>{result.answers[i]===q.correctIndex?'Correcta':'Para repasar'}:</strong> tu respuesta fue {q.options[result.answers[i]]}.</p>{result.answers[i]!==q.correctIndex&&<p>Respuesta correcta: <strong>{q.options[q.correctIndex]}</strong>.</p>}{q.explanation&&<p>{q.explanation}</p>}{q.speciesId&&<Link to={`/especies/${q.speciesId}/`}>Consultar la ficha de la especie</Link>}</div>)}
   </article>}
   {!editor&&!active&&<div><h2>Explora los cuestionarios</h2><p className="muted">Actividades publicadas por profesores y administradores.{canCreate?' También verás tus borradores.':''}</p><div className="cards">{quizzes.map(q=><article className="panel flex flex-col gap-3" key={q.id}><div className="flex flex-wrap gap-2"><span className="status">{q.published?'Disponible':'Borrador'}</span><span className="muted">{q.questionCount} {q.questionCount===1?'pregunta':'preguntas'}</span></div><h3>{q.title}</h3><p className="grow">{q.description||'Una nueva oportunidad para reconocer nuestro bosque.'}</p><div className="actions">{q.published&&<button className="button" disabled={busy} onClick={()=>openQuiz(q.id)}>Responder</button>}{q.canEdit&&<button className="button outline" disabled={busy} onClick={()=>openQuiz(q.id,true)}>Editar</button>}</div></article>)}</div>{!quizzes.length&&<div className="panel"><h3>El aula está creciendo</h3><p>{canCreate?'Crea el primer cuestionario para invitar a reconocer las especies.':'Pronto encontrarás actividades para explorar las especies. Mientras tanto, visita la colección.'}</p><Link to="/catalogo/">Explorar especies</Link></div>}</div>}
   <div><h2>Mis resultados</h2><p className="muted">Tus últimos 100 intentos. Cada resultado conserva las preguntas que respondiste en ese momento.</p>{attempts.length?<div className="space-y-3">{attempts.map(a=><article className="panel flex flex-wrap items-center justify-between gap-4" key={a.id}><div><h3>{a.title}</h3><p className="muted">{new Date(a.submittedAt).toLocaleString('es-CO')} · Versión {a.version}</p></div><div className="actions"><strong>{a.score} / {a.total}</strong><button className="button outline small" disabled={busy||Boolean(editor)||Boolean(active)} onClick={()=>{setResult(a);setError('');}}>Revisar respuestas</button></div></article>)}</div>:<p className="empty">Tu primer intento aparecerá aquí. Elige un cuestionario para comenzar.</p>}</div>
  </>}
 </section>;
}

