import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateLocation,validatePhoto,validateSpecies,mapPoints} from '../functions/domain.js';

test('photo locations are validated, rounded and optional',()=>{
 assert.equal(validateLocation(undefined),undefined);assert.equal(validateLocation(null),null);
 assert.deepEqual(validateLocation({latitude:7.06512345,longitude:'-73.8541239',source:'exif'}),{latitude:7.065123,longitude:-73.854124,source:'exif'});
 for(const bad of [{latitude:91,longitude:0,source:'exif'},{latitude:7,longitude:-181,source:'manual'},{latitude:7,source:'device'},{latitude:7,longitude:-73,source:'gps'},{latitude:7,longitude:-73,source:'exif',extra:1},'7,-73'])assert.throws(()=>validateLocation(bad));
 const photo=validatePhoto({path:'species/a/photos/x.jpg',caption:'Hoja',location:{latitude:7,longitude:-73,source:'manual'}},'a');assert.deepEqual(photo.location,{latitude:7,longitude:-73,source:'manual'});
 assert.equal('location' in validatePhoto({path:'species/a/photos/x.jpg',caption:'Hoja'},'a'),false);
 const species={common_name:'A',scientific_name:'A a',family:'F'};
 assert.deepEqual(validateSpecies({...species,photo:'species/a/photos/x.jpg',photo_location:{latitude:1,longitude:2,source:'device'}}).photo_location,{latitude:1,longitude:2,source:'device'});
 assert.equal(validateSpecies({...species,photo:'',photo_location:{latitude:1,longitude:2,source:'device'}}).photo_location,null);
});

test('map points combine cover photo, gallery and specimens without duplicates',()=>{
 const cover='species/a/photos/cover.jpg',location={latitude:7,longitude:-73,source:'exif'};
 const points=mapPoints({common_name:'Ceiba',photo:cover,photo_location:location},[{id:'p0',path:cover,caption:'Portada',location},{id:'p1',path:'species/a/photos/b.jpg',caption:'Flor',location:{latitude:7.1,longitude:-73.1,source:'manual'}},{id:'p2',path:'species/a/photos/c.jpg',caption:'Sin GPS'}],[{id:'s1',code:'C-1',zone:'Jardín',latitude:7.2,longitude:-73.2},{id:'s2',code:'C-2',zone:'Patio',latitude:null,longitude:null}]);
 assert.deepEqual(points.map(p=>[p.type,p.id,p.caption]),[['photo','main','Ceiba'],['photo','p1','Flor'],['specimen','s1','C-1 · Jardín']]);
 assert.deepEqual(mapPoints({photo:'',photo_location:location},[],[]),[]);
});
