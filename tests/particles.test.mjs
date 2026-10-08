import test from 'node:test';
import assert from 'node:assert/strict';
import { startParticles } from '../src/particles.js';

test('particles accelerate from rest through half speed, and emit only at the thumb', () => {
  const originals = new Map();
  const set = (name, value) => { originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name)); Object.defineProperty(globalThis, name, { value, configurable:true, writable:true }); };
  const random = Math.random;
  let next, value = 1, arcs = [], clipWidth = 0;
  const ctx = { setTransform(){}, clearRect(){ arcs=[]; }, save(){}, restore(){}, beginPath(){},
    rect(x,y,width){ clipWidth=width; }, clip(){}, fill(){},
    arc(x,y,radius){ arcs.push({x,y,radius}); }, createRadialGradient(){ return {addColorStop(){}}; } };
  try {
    Math.random = () => .5;
    set('devicePixelRatio',1);
    set('matchMedia',()=>({matches:false,addEventListener(){},removeEventListener(){}}));
    set('document',{hidden:false,addEventListener(){},removeEventListener(){}});
    set('ResizeObserver',class {observe(){} disconnect(){}});
    set('IntersectionObserver',class {observe(){} disconnect(){}});
    set('requestAnimationFrame',fn=>{next=fn;return 1});
    set('cancelAnimationFrame',()=>{});
    const stop=startParticles({getContext:()=>ctx,getBoundingClientRect:()=>({width:300,height:28})},()=>value);
    next(100);
    const deltas=[];
    let time=100;
    for(value of [1,1.5,2,2.5,3]) {
      const before=arcs[0].x;
      next(time+=16);
      deltas.push(before-arcs[0].x);
      assert.equal(clipWidth,14+272*value/3);
      assert.ok(arcs.every(p=>p.x<=clipWidth));
    }
    assert.equal(deltas[0],0);
    for(let i=1;i<5;i++) assert.ok(Math.abs(deltas[i]/deltas[4]-i/4)<1e-8);
    value=2;
    for(let i=0;i<180;i++) {
      next(time+=16);
      assert.ok(arcs.every(p=>p.x<=14+272*2/3));
    }
    stop();
  } finally {
    Math.random=random;
    for(const [name,descriptor] of originals) { if(descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name]; }
  }
});
