import test from 'node:test';
import assert from 'node:assert/strict';
import {start,finish,subscribe,getSnapshot} from '../src/loading.js';
test('tracks overlapping work and never goes below zero',()=>{assert.equal(getSnapshot(),0);start();start();assert.equal(getSnapshot(),2);finish();assert.equal(getSnapshot(),1);finish();finish();assert.equal(getSnapshot(),0);});
test('notifies subscribers on changes and supports unsubscribe',()=>{const values=[],other=[];const off=subscribe(()=>values.push(getSnapshot())),stop=subscribe(()=>other.push(getSnapshot()));start();off();start();finish();finish();finish();stop();assert.deepEqual(values,[1]);assert.deepEqual(other,[1,2,1,0]);});
