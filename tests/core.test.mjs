import test from 'node:test';
import assert from 'node:assert/strict';
import { currentTier, findChoice, makeParticle, nearestTier, selectionForModel, supportedTiers } from '../src/core.js';
const model = { id: 'deepseek-v4-flash', reasoning: { efforts: ['off','low','high','max'].map(id => ({ id })), defaultEffort: 'high' } };
const group = { id: 'deepseek-account', models: [model] };
test('catalog capability metadata controls all four native values', () => {
  const state = { current: { provider: group.id, model: model.id }, groups: [group] };
  assert.deepEqual(findChoice(state), { group, model });
  assert.equal(currentTier(state, model), 2);
  assert.deepEqual(supportedTiers(model), [0,1,2,3]);
  assert.deepEqual(supportedTiers({ reasoning: { efforts: [{id:'off'}] } }), [0]);
  assert.equal(nearestTier(2.9, [0]), 0);
});
test('model change retains an advertised effort and otherwise uses provider default', () => {
  assert.equal(selectionForModel(group, model, 'max').reasoningEffort, 'max');
  assert.equal(selectionForModel(group, model, 'medium').reasoningEffort, 'high');
  assert.deepEqual(selectionForModel(group, { id: 'no-reasoning' }, 'max'), { provider: group.id, model: 'no-reasoning' });
});
test('unknown or vanished model has no fabricated supported tiers', () => {
  assert.equal(findChoice({ groups:[group], current:{ provider:group.id, model:'removed' } }), undefined);
  assert.deepEqual(supportedTiers(undefined), []);
  assert.equal(currentTier({ current:{ reasoningEffort:'medium' } }, model), -1);
});
test('particle depth increases size and visibility while reducing speed; final alpha capped', () => {
  const far = makeParticle(300,28,0), near = makeParticle(300,28,1);
  assert.ok(far.radius < near.radius && far.opacity < near.opacity && far.speed > near.speed);
  assert.ok(near.opacity * .64 <= .65);
  assert.ok(!('tail' in near));
});
