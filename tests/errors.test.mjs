import {test} from 'node:test';
import assert from 'node:assert/strict';
import {messageFor,cleanMessage,blockedMessage} from '../src/errors.js';

test('server messages lose the HTTP status and technical codes',()=>{
 assert.equal(messageFor({code:'functions/failed-precondition',message:'Ya enviaste una propuesta hoy. [400]'}),'Ya enviaste una propuesta hoy.');
 assert.equal(messageFor({code:'functions/permission-denied',message:'Tu rol no permite esta operación. [403]'}),'Tu rol no permite esta operación.');
 assert.equal(cleanMessage('Firebase: Error (auth/missing-email).'),'Error');
 assert.equal(cleanMessage('Texto.. [500]'),'Texto.');
});

test('known codes get clear Spanish messages',()=>{
 assert.equal(messageFor({code:'auth/user-disabled'}),blockedMessage);
 assert.equal(messageFor({code:'auth/email-already-in-use',message:'Firebase: Error (auth/email-already-in-use).'}),'Ya existe una cuenta con este correo.');
 assert.equal(messageFor({code:'permission-denied',message:'Missing or insufficient permissions.'}),'No tienes acceso a este registro o ya no está publicado.');
 assert.equal(messageFor({code:'functions/unavailable',message:'unavailable [503]'}),'No se pudo conectar con Firebase. Comprueba los emuladores o tu conexión.');
 assert.equal(messageFor({}),'No se pudo completar la operación.');
 assert.equal(messageFor({code:'auth/missing-password',message:'Firebase: Error (auth/missing-password).'}),'No se pudo completar la operación.');
});
