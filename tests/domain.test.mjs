import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSpecies,validateSpecimen,validatePhoto,keyFor,requireAdmin} from '../functions/domain.js';
import {mediaName} from '../functions/import-utils.js';
const plant={common_name:'Ceiba',scientific_name:'Ceiba pentandra',family:'Malvaceae',habit:'tree',is_published:true};
test('species preserves required fields and rejects incomplete or forged metadata',()=>{
 assert.equal(validateSpecies(plant).common_name,'Ceiba');
 assert.throws(()=>validateSpecies({...plant,scientific_name:''}));
 assert.throws(()=>validateSpecies({...plant,habit:'invalid'}));
 assert.throws(()=>validateSpecies({...plant,specimen_count:100}));
 assert.throws(()=>validateSpecies({...plant,is_published:'false'}));
});
test('specimen enforces coordinate pair, height and calendar date',()=>{
 assert.equal(validateSpecimen({code:'C-01',zone:'Campus',height:'1.5'}).height,1.5);
 assert.throws(()=>validateSpecimen({code:'C',zone:'Campus',latitude:'7'}));
 assert.throws(()=>validateSpecimen({code:'C',zone:'Campus',height:'-1'}));
 assert.throws(()=>validateSpecimen({code:'C',zone:'Campus',observed_on:'2026-02-30'}));
});
test('canonical uniqueness and server-only administrator claim',()=>{
 assert.equal(keyFor('  CEIBA  pentandra '),keyFor('ceiba pentandra'));
 assert.throws(()=>requireAdmin(null)); assert.throws(()=>requireAdmin({token:{admin:false}}));
 assert.doesNotThrow(()=>requireAdmin({token:{admin:true}}));
});
test('photos keep credits and cannot reference another species storage path',()=>{
 assert.equal(validatePhoto({caption:'Hoja',credit:'UNIPAZ',path:'species/8/photos/a.webp',position:0},'8').credit,'UNIPAZ');
 assert.throws(()=>validatePhoto({caption:'Hoja',path:'species/9/photos/a.webp'},'8'));
 assert.throws(()=>validatePhoto({caption:'',path:'species/8/photos/a.webp'},'8'));
});
test('import media names remain compatible with editing even for Unicode filenames',()=>{
 const name=mediaName('photos/2026/Flor amarilla áé.WEBP');
 assert.match(name,/^[a-f0-9]{24}\.webp$/);
 assert.doesNotThrow(()=>validatePhoto({caption:'Original',path:`species/8/photos/${name}`},'8'));
});
