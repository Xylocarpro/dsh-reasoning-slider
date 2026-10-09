import test from 'node:test';
import assert from 'node:assert/strict';
import { flowForLayer, startParticles } from '../src/particles.js';

function harness() {
  const originals = new Map();
  const set = (name, value) => {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  };
  let next, now = 0, arcs = [], clipWidth = 0, stops = [];
  const ctx = {
    setTransform() {}, clearRect() { arcs = []; stops = []; }, save() {}, restore() {}, beginPath() {},
    rect(x, y, width) { clipWidth = width; }, clip() {}, fill() {},
    arc(x, y, radius) { arcs.push({ x, y, radius }); },
    createRadialGradient() { return { addColorStop(offset, color) { stops.push({ offset, color }); } }; },
  };
  let seed = 12345;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  set('devicePixelRatio', 1);
  set('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  set('document', { hidden: false, addEventListener() {}, removeEventListener() {} });
  set('ResizeObserver', class { observe() {} disconnect() {} });
  set('IntersectionObserver', class { observe() {} disconnect() {} });
  set('requestAnimationFrame', fn => { next = fn; return 1; });
  set('cancelAnimationFrame', () => {});
  const canvas = { getContext: () => ctx, getBoundingClientRect: () => ({ width: 300, height: 28 }) };
  return {
    canvas, arcs: () => arcs, stops: () => stops, clipWidth: () => clipWidth,
    step: ms => { now += ms; next(now); }, random,
    restore: () => { for (const [name, descriptor] of originals) descriptor
      ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name]; },
  };
}

test('a pre-seeded full-track pool is revealed only by the progress mask', () => {
  const h = harness(), state = { position: 1, powered: false };
  const originalRandom = Math.random; Math.random = h.random;
  try {
    const stop = startParticles(h.canvas, () => state); h.step(0);
    assert.equal(h.arcs().length, 0);
    state.position = 2; h.step(16);
    const highVisible = h.arcs().filter(point => point.x <= h.clipWidth()).length;
    assert.ok(highVisible >= 10 && highVisible <= 14, `High visible population: ${highVisible}`);
    const highPositions = h.arcs().map(point => point.x);
    state.position = 2.5; h.step(16);
    for (const x of highPositions) {
      assert.ok(h.arcs().some(point => Math.abs(point.x - x) < .15),
        `changing progress must not rescale particle coordinate ${x}`);
    }
    state.position = 3; h.step(16); assert.equal(h.arcs().length, 25);
    assert.ok(h.arcs().every(point => point.x <= h.clipWidth()));
    stop();
  } finally { Math.random = originalRandom; h.restore(); }
});

test('new particles fade in continuously as slider progress reveals a larger population', () => {
  const h = harness(), state = { position: 2.3, powered: false };
  const originalRandom = Math.random; Math.random = h.random;
  try {
    const stop = startParticles(h.canvas, () => state); h.step(0);
    h.step(16);
    const alphas = h.stops()
      .filter(stop => stop.offset === 0)
      .map(stop => Number(stop.color.match(/,([\d.]+)\)$/)?.[1] || 0));
    assert.ok(alphas.some(alpha => alpha > 0 && alpha < .1),
      `a newly revealed particle starts partially transparent: ${alphas.join(',')}`);
    stop();
  } finally { Math.random = originalRandom; h.restore(); }
});

test('far-to-near layers start their 0.8s ramps 35ms apart for acceleration and braking', () => {
  assert.ok(flowForLayer(.034, 0) > 0);
  assert.equal(flowForLayer(.034, 1), 0);
  assert.ok(flowForLayer(.071, 1) > 0);
  assert.equal(flowForLayer(.069, 2), 0);
  assert.ok(flowForLayer(.106, 3) > 0);
  assert.equal(flowForLayer(.104, 3), 0);

  assert.ok(flowForLayer(.036, 0, 1, 0) < 1);
  assert.equal(flowForLayer(.034, 1, 1, 0), 1);
  assert.ok(flowForLayer(.106, 3, 1, 0) < 1);
  assert.equal(flowForLayer(.905, 3), 1);
  assert.equal(flowForLayer(.905, 3, 1, 0), 0);
});

test('ease-in-out flow changes gently at both ends and is symmetric', () => {
  const startStep = flowForLayer(.01, 0) - flowForLayer(0, 0);
  const middleStep = flowForLayer(.41, 0) - flowForLayer(.4, 0);
  const endStep = flowForLayer(.8, 0) - flowForLayer(.79, 0);
  assert.ok(startStep < middleStep * .05, `gentle start: ${startStep}/${middleStep}`);
  assert.ok(endStep < middleStep * .05, `gentle finish: ${endStep}/${middleStep}`);
  assert.ok(Math.abs(flowForLayer(.2, 0) + flowForLayer(.6, 0) - 1) < 1e-12);
  assert.ok(Math.abs(flowForLayer(.4, 0) - .5) < 1e-12);
});

test('unpowered particles drift locally, then follow the 0.8s ease-in-out flow ramp', () => {
  const h = harness(), state = { position: 2, powered: false };
  const originalRandom = Math.random; Math.random = h.random;
  try {
    const stop = startParticles(h.canvas, () => state); h.step(0);
    const origin = h.arcs()[0];
    for (let i = 0; i < 300; i++) h.step(16);
    const drift = Math.hypot(h.arcs()[0].x - origin.x, h.arcs()[0].y - origin.y);
    assert.ok(drift <= 5, `idle drift stays local, got ${drift}`);

    state.powered = true;
    const tracked = h.arcs().findIndex(point => point.x > 220);
    assert.ok(tracked >= 0, 'needs a particle away from the wrap boundary');
    const checkpoints = [];
    for (let i = 0; i < 55; i++) {
      const before = h.arcs()[tracked].x; h.step(16);
      checkpoints.push(before - h.arcs()[tracked].x);
    }
    const early = checkpoints.slice(0, 16).reduce((a, b) => a + b, 0);
    const lateWindow = checkpoints.slice(32, 48).reduce((a, b) => a + b, 0);
    assert.ok(early < lateWindow * .18, `ease-in-out ramp starts gently: ${early}/${lateWindow}`);
    const late = checkpoints.slice(50).reduce((a, b) => a + b, 0) / 5;
    assert.ok(late > .9 && late < 2, `High reaches its configured half speed, got ${late}`);

    state.powered = false;
    const braking = [];
    for (let i = 0; i < 55; i++) {
      const before = h.arcs()[tracked].x; h.step(16); braking.push(before - h.arcs()[tracked].x);
    }
    const brakeStart = braking.slice(0, 16).reduce((a, b) => a + b, 0);
    const brakeEnd = braking.slice(32, 48).reduce((a, b) => a + b, 0);
    assert.ok(brakeStart > brakeEnd * 1.3, `braking uses the mirrored curve: ${brakeStart}/${brakeEnd}`);
    assert.ok(h.arcs().length <= 40); stop();
  } finally { Math.random = originalRandom; h.restore(); }
});

test('High flow remains slower than Ultra after both ramps complete', () => {
  const measure = position => {
    const h = harness(), state = { position, powered: true };
    const originalRandom = Math.random; Math.random = h.random;
    try {
      const stop = startParticles(h.canvas, () => state); h.step(0);
      for (let i = 0; i < 40; i++) h.step(16);
      const before = h.arcs()[0].x; h.step(16);
      const delta = before - h.arcs()[0].x; stop(); return delta;
    } finally { Math.random = originalRandom; h.restore(); }
  };
  const high = measure(2), ultra = measure(3);
  assert.ok(high > 0 && ultra > high * 1.5, `High/Ultra speed ratio: ${high}/${ultra}`);
});
