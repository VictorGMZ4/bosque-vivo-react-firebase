import {test} from 'node:test';
import assert from 'node:assert/strict';
import {campus,campusRadiusKm,distanceKm} from '../src/campus.js';

test('distance to the campus decides whether the map centres on the visitor',()=>{
 assert.equal(distanceKm(campus,campus),0);
 assert.ok(Math.abs(distanceKm({latitude:0,longitude:0},{latitude:1,longitude:0})-111.19)<0.1);
 assert.ok(distanceKm(campus,{latitude:campus.latitude+0.005,longitude:campus.longitude})<campusRadiusKm);
 assert.ok(distanceKm(campus,{latitude:4.711,longitude:-74.0721})>campusRadiusKm);
});
