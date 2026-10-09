import {test} from 'node:test';
import assert from 'node:assert/strict';

test('learning protects answers, grades on the server and preserves private attempt snapshots',async()=>{
 assert.equal(process.env.GCLOUD_PROJECT,'demo-bosque-vivo','Use the demo project only');
 assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(127\.0\.0\.1|localhost):\d+$/,'Local Firestore emulator required');
 const {learningAction}=await import('../functions/learning.js');
 const {db}=await import('../functions/firebase.js');
 const stamp=Date.now(),teacher={uid:`learn-teacher-${stamp}`},other={uid:`learn-other-${stamp}`},student={uid:`learn-student-${stamp}`},admin={uid:`learn-admin-${stamp}`};
 let id;
 const data={title:'Reconocer hojas',description:'Observa la forma de las hojas.',published:true,questions:[{prompt:'¿Qué especie tiene hojas compuestas?',options:['Guayacán','Mango'],correctIndex:0,explanation:'El guayacán presenta hojas compuestas.',speciesId:''}]};
 const call=(auth,action,input={})=>learningAction(auth,{action,...input});
 try{
  for(const [auth,role] of [[teacher,'teacher'],[other,'teacher'],[student,'student'],[admin,'admin']])await db.collection('roles').doc(auth.uid).set({role});
  await assert.rejects(call(null,'learningList'),{code:'unauthenticated'});
  await assert.rejects(call(student,'learningSave',{data}),{code:'permission-denied'});
  await assert.rejects(call(teacher,'learningSave',{data:{...data,questions:[{...data.questions[0],correctIndex:3}]}}),{code:'invalid-argument'});
  ({id}=await call(teacher,'learningSave',{data}));
  const loaded=await call(student,'learningGet',{id});
  assert.equal(loaded.quiz.questions[0].correctIndex,undefined);
  assert.equal(loaded.quiz.questions[0].explanation,undefined);
  assert.equal(loaded.quiz.canEdit,false);
  const list=await call(student,'learningList');
  assert.equal(list.quizzes.find(q=>q.id===id).questions,undefined);
  await assert.rejects(call(other,'learningSave',{id,version:1,data}),{code:'permission-denied'});
  await assert.rejects(call(student,'learningSubmit',{id,version:1,attemptId:'bad',answers:[9]}),{code:'invalid-argument'});
  const result=await call(student,'learningSubmit',{id,version:1,attemptId:'first',answers:[1],score:100,ownerId:teacher.uid});
  assert.equal(result.attempt.score,0);
  assert.equal(result.attempt.total,1);
  assert.equal(result.attempt.ownerId,student.uid);
  assert.equal(result.attempt.questions[0].correctIndex,0);
  const repeat=await call(student,'learningSubmit',{id,version:1,attemptId:'first',answers:[0]});
  assert.equal(repeat.attempt.score,0,'A retry cannot rewrite an attempt');
  const correct=await call(student,'learningSubmit',{id,version:1,attemptId:'second',answers:[0]});
  assert.equal(correct.attempt.score,1,'Correct answers earn a point on the server');
  assert.equal((await call(other,'learningResults',{uid:student.uid})).attempts.length,0);
  await call(admin,'learningSave',{id,version:1,data:{...data,title:'Nueva versión',questions:[{...data.questions[0],correctIndex:1}]}});
  await assert.rejects(call(teacher,'learningSave',{id,version:1,data}),{code:'failed-precondition'});
  await assert.rejects(call(student,'learningSubmit',{id,version:1,attemptId:'stale',answers:[0]}),{code:'failed-precondition'});
  const history=await call(student,'learningResults');
  assert.equal(history.attempts.length,2);
  assert.equal(history.attempts[0].title,'Reconocer hojas');
  assert.equal(history.attempts[0].questions[0].correctIndex,0);
  await call(teacher,'learningSave',{id,version:2,data:{...data,published:false}});
  await assert.rejects(call(student,'learningGet',{id}),{code:'permission-denied'});
  assert.equal((await call(student,'learningList')).quizzes.some(q=>q.id===id),false);
  await assert.rejects(call(student,'learningSubmit',{id,version:3,attemptId:'draft',answers:[0]}),{code:'permission-denied'});
 }finally{
  if(id)await db.collection('learning_quizzes').doc(id).delete();
  for(const auth of [teacher,other,student,admin]){await db.collection('roles').doc(auth.uid).delete();const attempts=await db.collection('learning_results').doc(auth.uid).collection('attempts').get();await Promise.all(attempts.docs.map(d=>d.ref.delete()));}
 }
});
