import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as domain from '../functions/domain.js';
const {validateLocation,validatePhoto,validateSpecies,mapPoints,validateSpecimen}=domain;

test('specimen codes normalize accents, skip nonletters and fall back for short names',()=>{
 assert.equal(typeof domain.specimenCode,'function');
 for(const [name,n,expected]of [['Árbol nomeolvides',1,'ARB-001'],[' 12 G-í.rasol',2,'GIR-002'],['Sol',9,'SOL-009'],['Ár',1,'EJM-001'],['123',12,'EJM-012'],['',1000,'EJM-1000']])assert.equal(domain.specimenCode(name,n),expected);
});

test('specimens accept an optional zone and photo while preserving code and coordinate validation',()=>{
 const data=validateSpecimen({code:'A-001',photo:'species/a/photos/a.jpg'});
 assert.equal(data.zone,'');assert.equal(data.photo,'species/a/photos/a.jpg');assert.equal(data.latitude,null);
 assert.throws(()=>validateSpecimen({}));assert.equal(validateSpecimen({},false).code,'');
 assert.throws(()=>validateSpecimen({code:'A',zone:'x'.repeat(141)}));assert.throws(()=>validateSpecimen({code:'A',latitude:7}));
});

test('specimen map points include their photo or an empty path',()=>{
 const points=mapPoints({},[],[{id:'a',photo:'species/a/photos/a.jpg',latitude:7,longitude:-73},{id:'b',latitude:7,longitude:-73}]);
 assert.deepEqual(points.map(p=>p.path),['species/a/photos/a.jpg','']);
});

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
