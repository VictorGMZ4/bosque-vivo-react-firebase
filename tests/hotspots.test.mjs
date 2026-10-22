import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSpecies,validateHotspots,validateSubmissionModel} from '../functions/domain.js';
const point={id:'point-1',title:'Hoja',description:'Texto del autor',position:[1,2,3],normal:[0,1,0]};
test('hotspots validate structure, bounds, identifiers and text',()=>{
 assert.deepEqual(validateHotspots([point]),[point]);
 for(const invalid of [[{...point,position:[NaN,0,0]}],[{...point,normal:[0,0,0]}],[{...point,title:' '}],[{...point,description:'x'.repeat(2001)}],[point,point],Array.from({length:31},(_,i)=>({...point,id:`p-${i}`})),[{...point,position:'1m 2m 3m'}],[{...point,html:'<script>'}]])assert.throws(()=>validateHotspots(invalid));
});
test('species hotspots require associated model, legacy payloads remain compatible',()=>{
 const data={common_name:'QA',scientific_name:'QA species',family:'QA'};
 assert.equal(validateSpecies(data).model_hotspots,undefined);
 assert.throws(()=>validateSpecies({...data,model_hotspots:[point]}));
 assert.deepEqual(validateSpecies({...data,model_3d:'species/a/models/a.glb',model_hotspots:[point]}).model_hotspots,[point]);
});
test('proposed models belong to the same proposal and reject foreign paths',()=>{
 assert.equal(validateSubmissionModel({path:'submissions/a/models/m.glb',credit:'Autor',hotspots:[point]},'a').hotspots.length,1);
 assert.throws(()=>validateSubmissionModel({path:'submissions/b/models/m.glb',credit:'',hotspots:[]},'a'));
 assert.throws(()=>validateSubmissionModel({path:'https://other/model.glb'},'a'));
 assert.equal(validateSubmissionModel(null,'a'),null);
});
