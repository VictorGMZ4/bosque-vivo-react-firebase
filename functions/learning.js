import {Timestamp} from 'firebase-admin/firestore';
import {db} from './firebase.js';
import {requireRole,roles} from './access.js';
import {fail,validateId} from './domain.js';

const quizzes=db.collection('learning_quizzes');
const attemptsFor=uid=>db.collection('learning_results').doc(uid).collection('attempts');
const editable=(quiz,auth,role)=>role==='admin'||role==='teacher'&&quiz.ownerId===auth.uid;
function text(value,label,max,required=false){
 if(value==null)value='';
 if(typeof value!=='string'||value.trim().length>max||required&&!value.trim())fail(`${label}: escribe ${required?'un texto de 1 a':'hasta'} ${max} caracteres.`);
 return value.trim();
}
function validateQuiz(data){
 if(!data||typeof data!=='object'||Array.isArray(data))fail('Cuestionario no válido.');
 if(typeof data.published!=='boolean')fail('Selecciona la visibilidad del cuestionario.');
 if(!Array.isArray(data.questions)||data.questions.length<1||data.questions.length>10)fail('Incluye entre 1 y 10 preguntas.');
 return {title:text(data.title,'Título',160,true),description:text(data.description,'Descripción',1000),published:data.published,questions:data.questions.map(q=>{
  if(!q||!Array.isArray(q.options)||q.options.length<2||q.options.length>4)fail('Cada pregunta necesita entre 2 y 4 opciones.');
  const options=q.options.map(o=>text(o,'Opción',240,true));
  if(new Set(options.map(o=>o.toLocaleLowerCase('es'))).size!==options.length)fail('Las opciones de una pregunta deben ser distintas.');
  if(!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>=options.length)fail('Selecciona una respuesta correcta para cada pregunta.');
  const speciesId=q.speciesId?validateId(q.speciesId):'';
  return {prompt:text(q.prompt,'Pregunta',1000,true),options,correctIndex:q.correctIndex,explanation:text(q.explanation,'Explicación',1000),speciesId};
 })};
}
const metadata=(id,q,canEdit)=>({id,title:q.title,description:q.description,published:q.published,version:q.version,questionCount:q.questions.length,canEdit});
function attemptView(id,data){return {id,...data,submittedAt:data.submittedAt.toDate().toISOString()};}

export async function learningAction(auth,input){
 const role=await requireRole(auth,roles);
 if(input.action==='learningList'){
  const published=await quizzes.where('published','==',true).limit(100).get();
  const rows=new Map(published.docs.map(d=>[d.id,d]));
  if(role==='teacher'||role==='admin'){
   const managed=await (role==='admin'?quizzes:quizzes.where('ownerId','==',auth.uid)).limit(100).get();
   for(const d of managed.docs)rows.set(d.id,d);
  }
  return {quizzes:[...rows.values()].map(d=>metadata(d.id,d.data(),editable(d.data(),auth,role))).sort((a,b)=>a.title.localeCompare(b.title,'es'))};
 }
 if(input.action==='learningResults'){
  const snapshot=await attemptsFor(auth.uid).orderBy('submittedAt','desc').limit(100).get();
  return {attempts:snapshot.docs.map(d=>attemptView(d.id,d.data()))};
 }
 if(input.action==='learningGet'){
  const ref=quizzes.doc(validateId(input.id)),snapshot=await ref.get();
  if(!snapshot.exists)fail('El cuestionario ya no existe.','not-found');
  const data=snapshot.data(),canEdit=editable(data,auth,role);
  if(!data.published&&!canEdit)fail('El cuestionario todavía no está publicado.','permission-denied');
  return {quiz:{...metadata(ref.id,data,canEdit),questions:data.questions.map(q=>canEdit?{...q}:{prompt:q.prompt,options:q.options,speciesId:q.speciesId})}};
 }
 if(input.action==='learningSave'){
  await requireRole(auth,['teacher','admin']);
  const data=validateQuiz(input.data),ref=input.id?quizzes.doc(validateId(input.id)):quizzes.doc();
  return db.runTransaction(async tx=>{
   const currentRole=await requireRole(auth,['teacher','admin'],tx),snapshot=await tx.get(ref);
   if(input.id&&!snapshot.exists)fail('El cuestionario ya no existe.','not-found');
   const previous=snapshot.data();
   if(previous&&!editable(previous,auth,currentRole))fail('Solo el autor o un administrador puede editarlo.','permission-denied');
   if(previous&&input.version!==previous.version)fail('El cuestionario cambió. Ábrelo de nuevo antes de guardar.','failed-precondition');
   for(const speciesId of new Set(data.questions.map(q=>q.speciesId).filter(Boolean))){
    const species=await tx.get(db.collection('species').doc(speciesId));
    if(!species.exists||species.data().is_published!==true)fail('La especie de referencia debe estar publicada.');
   }
   const now=Timestamp.now(),version=(previous?.version||0)+1;
   tx.set(ref,{...data,ownerId:previous?.ownerId||auth.uid,version,createdAt:previous?.createdAt||now,updatedAt:now});
   return {id:ref.id,version};
  });
 }
 if(input.action==='learningSubmit'){
  const ref=quizzes.doc(validateId(input.id)),attemptRef=attemptsFor(auth.uid).doc(validateId(input.attemptId));
  return db.runTransaction(async tx=>{
   await requireRole(auth,roles,tx);
   const [snapshot,existing]=await Promise.all([tx.get(ref),tx.get(attemptRef)]);
   if(existing.exists){const saved=existing.data();if(saved.quizId!==ref.id||saved.version!==input.version)fail('Este identificador de intento ya se utilizó.','already-exists');return {attempt:attemptView(attemptRef.id,saved)};}
   if(!snapshot.exists)fail('El cuestionario ya no existe.','not-found');
   const quiz=snapshot.data();
   if(!quiz.published)fail('Este cuestionario no está disponible.','permission-denied');
   if(input.version!==quiz.version)fail('El cuestionario cambió. Vuelve a abrirlo para responder su nueva versión.','failed-precondition');
   if(!Array.isArray(input.answers)||input.answers.length!==quiz.questions.length||input.answers.some((answer,i)=>!Number.isInteger(answer)||answer<0||answer>=quiz.questions[i].options.length))fail('Responde todas las preguntas con una opción válida.');
   const score=quiz.questions.reduce((total,q,i)=>total+(input.answers[i]===q.correctIndex?1:0),0);
   const attempt={ownerId:auth.uid,quizId:ref.id,version:quiz.version,title:quiz.title,questions:quiz.questions,answers:input.answers,score,total:quiz.questions.length,submittedAt:Timestamp.now()};
   tx.create(attemptRef,attempt);
   return {attempt:attemptView(attemptRef.id,attempt)};
  });
 }
 fail('Acción educativa no válida.');
}
