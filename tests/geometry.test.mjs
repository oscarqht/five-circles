import {test} from 'node:test';
import assert from 'node:assert/strict';
import {constrain,imagePoint,zoomAt,panBy,hitDifference,shuffle} from '../src/geometry.mjs';
const size={width:600,height:400};
const base={x:.5,y:.5,zoom:1};
test('zoom around a pointer preserves the image point under it',()=>{
  const point={x:200,y:150}, before=imagePoint(point,size,base), after=imagePoint(point,size,zoomAt(base,3,point,size));
  assert(Math.abs(before.x-after.x)<1e-12);assert(Math.abs(before.y-after.y)<1e-12);
});
test('panning and inverse hit coordinates agree after zoom',()=>{
  const view=panBy({...base,zoom:2},{x:60,y:-40},size);
  assert.deepEqual(view,{x:.45,y:.55,zoom:2});
  const target={x:.3,y:.6};
  const screen={x:(target.x-view.x)*size.width*view.zoom+size.width/2,y:(target.y-view.y)*size.height*view.zoom+size.height/2};
  const mapped=imagePoint(screen,size,view);assert(Math.abs(mapped.x-target.x)<1e-12);assert(Math.abs(mapped.y-target.y)<1e-12);
});
test('views are clamped to image edges and scale limits',()=>{
  assert.deepEqual(constrain({x:-2,y:4,zoom:1}),base);
  assert.deepEqual(constrain({x:0,y:1,zoom:8}),{x:.1,y:.9,zoom:5});
});
test('hit detection ignores found targets and accepts either viewport size',()=>{
  const d={id:'a',bounds:{x:.2,y:.3,width:.04,height:.05}};
  assert.equal(hitDifference({x:.22,y:.32},[d],[],size,2),d);
  assert.equal(hitDifference({x:.22,y:.32},[d],['a'],size,2),undefined);
  assert.equal(hitDifference({x:.5,y:.5},[d],[],size,2),undefined);
});
test('shuffling does not mutate input or lose rounds',()=>{
  const input=['a','b','c','d'], output=shuffle(input,()=>.2);
  assert.deepEqual(input,['a','b','c','d']);assert.deepEqual([...output].sort(),input);assert.notDeepEqual(output,input);
});
