import { clamp, makeParticle } from './core.js';

const HIGH_TARGET_COUNT = 12;
const ULTRA_TARGET_COUNT = 25;
const POOL_SIZE = 40;
const FLOW_RAMP_SECONDS = .8;
const LAYER_TRIGGER_DELAY_SECONDS = .035;
const LAYER_COUNT = 4;
const GOLDEN_FRACTION = .61803398875;

// A symmetric ease-in-out keeps both departure and arrival velocity changes
// gentle, avoiding a visible snap when a layer reaches its fixed flow speed.
const easeInOutSine = value => (1 - Math.cos(Math.PI * value)) / 2;
export const flowForLayer = (elapsed, layer, from = 0, to = 1) => {
  const localElapsed = elapsed - layer * LAYER_TRIGGER_DELAY_SECONDS;
  if (localElapsed <= 0) return from;
  const progress = clamp(localElapsed / FLOW_RAMP_SECONDS, 0, 1);
  return from + (to - from) * easeInOutSine(progress);
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

export function startParticles(canvas, getState = () => ({ position: 3, powered: false })) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, previous = 0, elapsed = 0, width = 0, height = 0;
  let points = [], visible = true, transitionTo = 0, lastPowered = false;
  let transitionElapsed = FLOW_RAMP_SECONDS + (LAYER_COUNT - 1) * LAYER_TRIGGER_DELAY_SECONDS;
  let layerFlows = Array(LAYER_COUNT).fill(0), transitionFrom = Array(LAYER_COUNT).fill(0);

  const current = () => readState(getState);
  const boundaryFor = position => 14 + Math.max(0, width - 28) * position / 3;
  const trackEnd = () => Math.max(14, width - 14);
  const targetCount = position => {
    if (position <= 1) return 0;
    if (position < 2) return HIGH_TARGET_COUNT * (position - 1);
    return HIGH_TARGET_COUNT + (ULTRA_TARGET_COUNT - HIGH_TARGET_COUNT) * (position - 2);
  };

  function seed() {
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

  function paint(dt) {
    const state = current(), boundary = boundaryFor(state.position);
    const visibleTarget = targetCount(state.position);
    // Compensate for the masked part of the full-track field, so High still
    // shows about 12 particles while their coordinates stay independent of it.
    const count = visibleTarget <= 0 ? 0 : Math.min(POOL_SIZE,
      visibleTarget * trackEnd() / Math.max(boundary, 1));
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
      point.x -= point.speed * speedScale * flow * dt;
      if (point.x < -point.radius * 3) {
        point.x = trackEnd() + Math.random() * 8;
        point.baseY = 5 + Math.random() * Math.max(1, height - 10);
        point.wanderX = 0; point.wanderY = 0;
      } else if (point.x > trackEnd() + 8) {
        point.x = trackEnd() + Math.random() * 8;
      }
    }

    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, boundary, height); ctx.clip();
    const rendered = points.slice(0, Math.ceil(count))
      .map((point, index) => ({ point, reveal: smoothstep(count - index) }))
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
  };
}
