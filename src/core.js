export const LEVELS = Object.freeze([
  { id: 'off', name: '关' }, { id: 'low', name: '轻度' },
  { id: 'high', name: '高' }, { id: 'max', name: 'Ultra' },
]);
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export function findChoice(state) {
  for (const group of state.groups ?? []) {
    const model = group.models.find(m => m.id === state.current?.model && group.id === state.current?.provider);
    if (model) return { group, model };
  }
}
export function supportedTiers(model) {
  const ids = new Set(model?.reasoning?.efforts.map(e => e.id) ?? []);
  return LEVELS.flatMap((level, i) => ids.has(level.id) ? [i] : []);
}
export function currentTier(state, model) {
  const effort = state.current?.reasoningEffort ?? model?.reasoning?.defaultEffort;
  return LEVELS.findIndex(level => level.id === effort);
}
export function nearestTier(value, supported) {
  return supported.reduce((best, i) => Math.abs(i - value) < Math.abs(best - value) ? i : best, supported[0] ?? -1);
}
export function selectionForModel(group, model, effort) {
  const next = model.reasoning?.efforts.some(e => e.id === effort) ? effort : model.reasoning?.defaultEffort;
  return { provider: group.id, model: model.id, ...(next === undefined ? {} : { reasoningEffort: next }) };
}
// Far-to-near ranges touch at their boundaries but never overlap, preserving
// depth order while giving every particle an independent velocity.
export const PARTICLE_SPEED_RANGES = Object.freeze([
  Object.freeze([204, 220]), Object.freeze([188, 204]),
  Object.freeze([172, 188]), Object.freeze([156, 172]),
]);

// Depth runs from the small, fast far plane to the large, slow near plane.
export function makeParticle(width, height, depth, random = Math.random) {
  // Keep the depth hierarchy while varying each particle inside its plane.
  const layer = clamp(Math.round(depth * 3), 0, 3);
  const [minSpeed, maxSpeed] = PARTICLE_SPEED_RANGES[layer];
  return { x: width + 10 + random() * Math.max(12, width * .35), y: 5 + random() * (height - 10), depth,
    layer, speed: minSpeed + random() * (maxSpeed - minSpeed),
    radius: .45 + depth * .7875 + (random() - .5) * .1,
    opacity: clamp(.24 + depth * .76 + (random() - .5) * .08, 0, 1), phase: random() * Math.PI * 2,
    driftAmplitude: .8 + depth * .8 + random() * .4,
    driftRate: 1.8 + random() * .8 };
}
