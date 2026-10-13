import test from 'node:test';
import assert from 'node:assert/strict';
import {coverCampus} from '../src/campus-scene-math.js';

test('la fotografía cubre pantallas verticales y panorámicas incluso al mover la cámara',()=>{
 for(const [w,h] of [[390,844],[1920,1080],[2560,800],[800,1200]]){
  const {width,height,panX,panY}=coverCampus(w,h,4/3);
  assert.ok(width/2-panX>=w/h);
  assert.ok(height/2-panY>=1);
 }
});
test('un contenedor temporalmente sin dimensiones produce valores finitos',()=>{
 for(const number of Object.values(coverCampus(0,0,4/3)))assert.ok(Number.isFinite(number));
});
