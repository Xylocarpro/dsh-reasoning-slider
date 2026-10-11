import { clamp, makeParticle } from './core.js';

const HIGH_TARGET_COUNT = 12;
const ULTRA_TARGET_COUNT = 25;
const POOL_SIZE = 40;
const FLOW_RAMP_SECONDS = .8;
const LAYER_TRIGGER_DELAY_SECONDS = .035;
const LAYER_COUNT = 4;
const GOLDEN_FRACTION = .61803398875;
const POWERED_SPEED_BOOST = .3;
const PARTICLE_REVEAL_SECONDS = .5;
const PARTICLE_REVEAL_DELAY_SECONDS = .1;

// A symmetric ease-in-out keeps both departure and arrival velocity changes
// gentle, avoiding a visible snap when a layer reaches its fixed flow speed.
const easeInOutSine = value => (1 - Math.cos(Math.PI * value)) / 2;
export const flowForLayer = (elapsed, layer, from = 0, to = 1) => {
  const localElapsed = elapsed - layer * LAYER_TRIGGER_DELAY_SECONDS;
  if (localElapsed <= 0) return from;
  const progress = clamp(localElapsed / FLOW_RAMP_SECONDS, 0, 1);
  return from + (to - from) * easeInOutSine(progress);
};
export const speedMultiplierForFlow = flow => 1 + POWERED_SPEED_BOOST * clamp(flow, 0, 1);
export const revealOrder = points => points.slice().sort((a, b) =>
  b.radius - a.radius || b.depth - a.depth || a.x - b.x);
export const revealLayerDelay = (layer, direction) => {
  const order = direction === 'in' ? [3, 2, 1, 0] : [0, 1, 2, 3];
  return order.indexOf(layer) * PARTICLE_REVEAL_DELAY_SECONDS;
};
export const revealLayerProgress = (elapsed, layer, direction, from = 0, to = 1) => {
  const progress = easeInOutSine(clamp(
    (elapsed - revealLayerDelay(layer, direction)) / PARTICLE_REVEAL_SECONDS, 0, 1));
  return from + (to - from) * progress;
};
export const revealLayerOpacity = (elapsed, layer, direction, from, to) => {
  if (from === to) return 1;
  const progress = revealLayerProgress(elapsed, layer, direction, 0, 1);
  return to > from ? progress : 1 - progress;
};
const smoothstep = value => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

function readState(getState) {
  const value = typeof getState === 'function' ? getState() : getState;
  if (value && typeof value === 'object') {
    return { position: clamp(Number(value.position) || 0, 0, 3), powered: value.powered === true };
  }
  return { position: clamp(Number(value) || 0, 0, 3), powered: true };
}

export function startParticles(canvas, getState = () => ({ position: 3, powered: false }), options = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const current = () => readState(getState);
  const initialPowered = current().powered;
  let restoreState = options.restore ?? null;
  let raf = 0, previous = 0, elapsed = 0, width = 0, height = 0;
  let points = [], visible = true, transitionTo = initialPowered ? 1 : 0, lastPowered = initialPowered;
  let transitionElapsed = FLOW_RAMP_SECONDS + (LAYER_COUNT - 1) * LAYER_TRIGGER_DELAY_SECONDS;
  let layerFlows = Array(LAYER_COUNT).fill(initialPowered ? 1 : 0);
  let transitionFrom = [...layerFlows];
  if (restoreState?.powered === initialPowered) {
    elapsed = Number(restoreState.elapsed) || 0;
    transitionTo = restoreState.transitionTo === 1 ? 1 : 0;
    transitionElapsed = Number.isFinite(restoreState.transitionElapsed)
      ? restoreState.transitionElapsed : transitionElapsed;
    layerFlows = Array.from({ length: LAYER_COUNT }, (_, layer) =>
      clamp(Number(restoreState.layerFlows?.[layer]) || 0, 0, 1));
    transitionFrom = Array.from({ length: LAYER_COUNT }, (_, layer) =>
      clamp(Number(restoreState.transitionFrom?.[layer]) || 0, 0, 1));
  } else {
    restoreState = null;
  }

  const boundaryFor = position => 14 + Math.max(0, width - 28) * position / 3;
  const trackEnd = () => Math.max(14, width - 14);
  const targetCount = position => {
    if (position <= 1) return 0;
    if (position < 2) return HIGH_TARGET_COUNT * (position - 1);
    return HIGH_TARGET_COUNT + (ULTRA_TARGET_COUNT - HIGH_TARGET_COUNT) * (position - 2);
  };
  let revealCount = targetCount(current().position);
  let revealFrom = revealCount;
  let revealTarget = revealCount;
  let revealElapsed = PARTICLE_REVEAL_SECONDS;
  let revealLayerCounts = Array(LAYER_COUNT).fill(0);
  let revealLayerFrom = Array(LAYER_COUNT).fill(0);
  let revealLayerTo = Array(LAYER_COUNT).fill(0);
  let revealLayerElapsed = PARTICLE_REVEAL_SECONDS + PARTICLE_REVEAL_DELAY_SECONDS * (LAYER_COUNT - 1);
  let revealLayerOpacityValues = Array(LAYER_COUNT).fill(1);
  let revealDirection = 'in';
  let revealInitialized = false;
  if (restoreState?.powered === initialPowered) {
    const restoredCount = Number(restoreState.revealCount);
    const restoredFrom = Number(restoreState.revealFrom);
    const restoredTarget = Number(restoreState.revealTarget);
    if (Number.isFinite(restoredCount)) revealCount = clamp(restoredCount, 0, POOL_SIZE);
    if (Number.isFinite(restoredFrom)) revealFrom = clamp(restoredFrom, 0, POOL_SIZE);
    if (Number.isFinite(restoredTarget)) revealTarget = clamp(restoredTarget, 0, POOL_SIZE);
    revealElapsed = Number.isFinite(restoreState.revealElapsed)
      ? restoreState.revealElapsed : revealElapsed;
    if (Array.isArray(restoreState.revealLayerCounts)) {
      revealLayerCounts = Array.from({ length: LAYER_COUNT }, (_, layer) =>
        clamp(Number(restoreState.revealLayerCounts[layer]) || 0, 0, POOL_SIZE));
      revealLayerFrom = Array.from({ length: LAYER_COUNT }, (_, layer) =>
        clamp(Number(restoreState.revealLayerFrom?.[layer]) || 0, 0, POOL_SIZE));
      revealLayerTo = Array.from({ length: LAYER_COUNT }, (_, layer) =>
        clamp(Number(restoreState.revealLayerTo?.[layer]) || 0, 0, POOL_SIZE));
      revealLayerElapsed = Number.isFinite(restoreState.revealLayerElapsed)
        ? restoreState.revealLayerElapsed : revealLayerElapsed;
      revealLayerOpacityValues = Array.from({ length: LAYER_COUNT }, (_, layer) => {
        const value = Number(restoreState.revealLayerOpacityValues?.[layer]);
        return Number.isFinite(value) ? clamp(value, 0, 1) : 1;
      });
      revealDirection = restoreState.revealDirection === 'out' ? 'out' : 'in';
      revealInitialized = true;
    }
  }

  function seed() {
    if (restoreState && Math.abs(restoreState.width - width) < 1
      && Math.abs(restoreState.height - height) < 1 && Array.isArray(restoreState.points)) {
      points = restoreState.points.map(point => ({ ...point }));
      restoreState = null;
      return;
    }
    restoreState = null;
    points = Array.from({ length: POOL_SIZE }, (_, i) => {
      const point = makeParticle(width, height, (i % 4) / 3);
      // Particle positions live in full-track coordinates. Progress only masks
      // them; dragging the thumb never rescales or moves the particle field.
      point.x = 4 + ((i * GOLDEN_FRACTION + Math.random() * .08) % 1) * Math.max(1, trackEnd() - 8);
      point.baseY = 5 + Math.random() * Math.max(1, height - 10);
      point.wanderX = 0; point.wanderY = 0;
      return point;
    });
  }

  function resize() {
    const box = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    width = box.width; height = box.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(); paint(0);
  }

  function wander(point, dt) {
    // Mean-reverting Brownian offsets stay within a few pixels without a
    // preferred direction. sqrt(dt) keeps the motion frame-rate independent.
    const noise = Math.sqrt(dt);
    point.wanderX = clamp(point.wanderX * Math.max(0, 1 - dt * .48)
      + (Math.random() - .5) * 1.15 * noise, -2.5, 2.5);
    point.wanderY = clamp(point.wanderY * Math.max(0, 1 - dt * .58)
      + (Math.random() - .5) * .95 * noise, -2, 2);
  }

  function layerTargets(count, ordered) {
    const targets = Array(LAYER_COUNT).fill(0);
    for (const point of ordered.slice(0, Math.ceil(count))) targets[point.layer] += 1;
    return targets;
  }

  function paint(dt) {
    const state = current(), boundary = boundaryFor(state.position);
    const visibleTarget = targetCount(state.position);
    // Compensate for the masked part of the full-track field, so High still
    // shows about 12 particles while their coordinates stay independent of it.
    const count = visibleTarget <= 0 ? 0 : Math.min(POOL_SIZE,
      visibleTarget * trackEnd() / Math.max(boundary, 1));
    const revealPool = revealOrder(points);
    if (!revealInitialized) {
      revealLayerCounts = layerTargets(count, revealPool);
      revealLayerFrom = [...revealLayerCounts]; revealLayerTo = [...revealLayerCounts];
      revealLayerOpacityValues = Array(LAYER_COUNT).fill(1);
      revealCount = count; revealTarget = count; revealInitialized = true;
    } else if (Math.abs(count - revealTarget) > .001) {
      const previousTarget = revealTarget;
      revealFrom = revealCount;
      revealTarget = count;
      revealElapsed = 0;
      revealDirection = count >= previousTarget ? 'in' : 'out';
      // Capture each layer's current and target population. On appearance the
      // nearest layer starts first; on disappearance the farthest starts first.
      revealLayerFrom = [...revealLayerCounts];
      revealLayerTo = layerTargets(count, revealPool);
      revealLayerElapsed = 0;
    }
    revealElapsed = Math.min(PARTICLE_REVEAL_SECONDS + PARTICLE_REVEAL_DELAY_SECONDS * 3, revealElapsed + dt);
    revealLayerElapsed = Math.min(PARTICLE_REVEAL_SECONDS + PARTICLE_REVEAL_DELAY_SECONDS * 3,
      revealLayerElapsed + dt);
    revealLayerCounts = revealLayerCounts.map((_, layer) => revealLayerProgress(
      revealLayerElapsed, layer, revealDirection, revealLayerFrom[layer], revealLayerTo[layer]));
    revealLayerOpacityValues = revealLayerOpacityValues.map((_, layer) => revealLayerOpacity(
      revealLayerElapsed, layer, revealDirection, revealLayerFrom[layer], revealLayerTo[layer]));
    revealCount = revealLayerCounts.reduce((sum, value) => sum + value, 0);
    if (state.powered !== lastPowered) {
      lastPowered = state.powered;
      transitionFrom = [...layerFlows];
      transitionTo = state.powered ? 1 : 0;
      transitionElapsed = 0;
    }
    transitionElapsed = Math.min(
      FLOW_RAMP_SECONDS + (LAYER_COUNT - 1) * LAYER_TRIGGER_DELAY_SECONDS,
      transitionElapsed + dt,
    );
    layerFlows = layerFlows.map((_, layer) =>
      flowForLayer(transitionElapsed, layer, transitionFrom[layer], transitionTo));
    const speedScale = clamp((state.position - 1) / 2, 0, 1);

    elapsed += dt;
    ctx.clearRect(0, 0, width, height);

    for (const point of points) {
      const flow = layerFlows[point.layer];
      wander(point, dt);
      point.x -= point.speed * speedScale * flow * speedMultiplierForFlow(flow) * dt;
      if (point.x < -point.radius * 3) {
        point.x = trackEnd() + Math.random() * 8;
        point.baseY = 5 + Math.random() * Math.max(1, height - 10);
        point.wanderX = 0; point.wanderY = 0;
      } else if (point.x > trackEnd() + 8) {
        point.x = trackEnd() + Math.random() * 8;
      }
    }

    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, boundary, height); ctx.clip();
    // Reveal near, larger particles first, then paint from far to near so the
    // depth stack remains natural while the reveal order stays size-driven.
    // Keep every particle that belongs to either side of this transition in
    // the render list. When fading out, shortening the global list from the
    // current count would remove trailing particles before their layer's
    // opacity ramp reached zero, which reads as an abrupt disappearance.
    const transitionRenderCount = revealLayerFrom.reduce((sum, from, layer) =>
      sum + Math.ceil(Math.max(from, revealLayerTo[layer])), 0);
    const renderCount = Math.min(POOL_SIZE, Math.max(
      Math.ceil(Math.max(count, revealCount)), transitionRenderCount));
    const layerRanks = new Map();
    revealPool.forEach(point => {
      const rank = layerRanks.get(point.layer) ?? 0;
      layerRanks.set(point.layer, rank + 1);
      point._revealRank = rank;
    });
    const rendered = revealPool.slice(0, renderCount)
      .map(point => ({ point, reveal: revealLayerOpacityValues[point.layer]
        * (point._revealRank < Math.ceil(Math.max(revealLayerFrom[point.layer], revealLayerTo[point.layer])) ? 1 : 0) }))
      .sort((a, b) => a.point.depth - b.point.depth);
    for (const { point, reveal } of rendered) {
      const flow = layerFlows[point.layer];
      const x = point.x + point.wanderX * (1 - flow);
      const y = point.baseY + point.wanderY
        + Math.sin(elapsed * point.driftRate + point.phase) * .35 * point.driftAmplitude;
      const alpha = point.opacity * reveal
        * clamp(x / 15, 0, 1) * clamp((boundary - x) / 10, 0, 1);
      const radius = point.radius * (2.1 + point.depth * .5);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(245,242,255,${alpha})`);
      gradient.addColorStop(.38, `rgba(240,237,255,${alpha * .88})`);
      gradient.addColorStop(.62, `rgba(234,231,255,${alpha * .28})`);
      gradient.addColorStop(1, 'rgba(234,231,255,0)');
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function frame(time) {
    raf = 0; paint(previous ? Math.min((time - previous) / 1000, .05) : 0); previous = time;
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(raf); raf = 0; previous = 0;
    if (!document.hidden && visible) {
      if (reduced.matches) paint(0); else raf = requestAnimationFrame(frame);
    }
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
  resize(); sync();
  return () => {
    cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect();
    document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync);
    options.onSuspend?.({
      width, height, elapsed, points: points.map(point => ({ ...point })),
      layerFlows: [...layerFlows], transitionFrom: [...transitionFrom], transitionTo,
      transitionElapsed, powered: lastPowered, revealCount, revealFrom,
      revealTarget, revealElapsed,
      revealLayerCounts: [...revealLayerCounts], revealLayerFrom: [...revealLayerFrom],
      revealLayerTo: [...revealLayerTo], revealLayerElapsed, revealDirection,
      revealLayerOpacityValues: [...revealLayerOpacityValues],
    });
  };
}
