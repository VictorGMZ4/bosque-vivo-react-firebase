import test from 'node:test';
import assert from 'node:assert/strict';
import {publicSnapshot} from '../src/offline.js';

test('offline snapshots reject drafts and missing publication status', () => {
  for (const is_published of [false, undefined, 'true', 1]) {
    assert.throws(() => publicSnapshot({id:'42',is_published,common_name:'Ceiba'}), /públicas/);
  }
  assert.throws(() => publicSnapshot({is_published:true}), /públicas/);
});

test('offline snapshots retain public botanical fields without private metadata or remote media', () => {
  const snapshot = publicSnapshot({id:'42',is_published:true,is_demo:true,common_name:'Ceiba',scientific_name:'Ceiba pentandra',family:'Malvaceae',description:'Descripción pública',precautions:'Precaución pública',references:'Fuente pública',photo_credit:'Autora original',owner:'private-owner',private_notes:'sensitive',model_3d:'species/42/models/model.glb',photo:'species/42/photos/photo.jpg',roles:{admin:true},submitted_by:'private-uid'});
  assert.equal(snapshot.id, '42');
  assert.equal(snapshot.common_name, 'Ceiba');
  assert.equal(snapshot.scientific_name, 'Ceiba pentandra');
  assert.equal(snapshot.precautions, 'Precaución pública');
  assert.equal(snapshot.photo_credit, 'Autora original');
  assert.equal(snapshot.is_demo, true);
  for (const key of ['owner','private_notes','model_3d','photo','roles','submitted_by']) assert.equal(Object.hasOwn(snapshot,key),false);
});

test('offline text fields cannot carry nested documents', () => {
  const snapshot = publicSnapshot({id:'42',is_published:true,description:{private:'secret'},family:['private']});
  assert.equal(snapshot.description, '');
  assert.equal(snapshot.family, '');
});
