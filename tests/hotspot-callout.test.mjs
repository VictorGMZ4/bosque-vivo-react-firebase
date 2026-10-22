import {test} from 'node:test';
import assert from 'node:assert/strict';
import {placeCallout} from '../src/hotspot-callout.js';
test('callout stays within viewport near all edges and on mobile',()=>{
 for(const [width,height]of [[320,320],[1100,560]])for(const [x,y]of [[0,0],[width,height],[width/2,height/2],[-100,900]]){
  const box=placeCallout({x,y,width,height,boxWidth:Math.min(280,width-24),boxHeight:190});
  assert.ok(box.left>=12&&box.top>=12);assert.ok(box.left+Math.min(280,width-24)<=width-12);assert.ok(box.top+190<=height-12);
 }
});
