import test from 'node:test';
import assert from 'node:assert/strict';
import {speciesPublicUrl} from '../src/qr-url.js';
test('QR preserves species routes and uses the configured public origin',()=>{
 assert.equal(speciesPublicUrl('8','http://127.0.0.1:4174'),'http://127.0.0.1:4174/especies/8/');
 assert.equal(speciesPublicUrl('8','https://preview.vercel.app','https://flora.example/'),'https://flora.example/especies/8/');
 assert.equal(speciesPublicUrl('a/b','https://flora.example'),'https://flora.example/especies/a%2Fb/');
});
test('QR rejects unsafe or ambiguous public origins',()=>{
 for(const origin of ['javascript:alert(1)','https://user:secret@flora.example','https://flora.example/path','https://flora.example/?q=1','https://flora.example/#top','not a URL'])assert.throws(()=>speciesPublicUrl('8','https://flora.example',origin));
});
