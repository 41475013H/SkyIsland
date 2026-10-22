import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = {};
vm.runInNewContext(readFileSync(new URL('../src/step3.js', import.meta.url), 'utf8'), context);
const {
  PICKUP_DISTANCE,
  createPickup,
  tryStartPickup,
  advancePickup,
  createInventory,
  collectPickup,
} = context.SkyIslandStep3;

test('STEP 3：走到掉落方塊旁邊時，小方塊會飛向玩家', () => {
  const player = { x: 0, y: 8.5, z: 0 };
  const pickup = createPickup('dirt', { x: PICKUP_DISTANCE - 0.1, y: 8, z: 0 });
  const inventory = createInventory();

  assert.equal(tryStartPickup(pickup, player), true);
  assert.equal(pickup.pickingUp, true);

  const startDistance = Math.hypot(pickup.position.x - player.x, pickup.position.y - player.y, pickup.position.z - player.z);
  advancePickup(pickup, player, 0.1);
  const movingDistance = Math.hypot(pickup.position.x - player.x, pickup.position.y - player.y, pickup.position.z - player.z);
  assert.ok(movingDistance < startDistance);

  advancePickup(pickup, player, 1);
  assert.equal(pickup.collected, true);
  assert.equal(collectPickup(inventory, pickup), true);
  assert.equal(inventory.dirt, 1);
});

test('STEP 3：距離 3 格以上時不會撿起掉落方塊', () => {
  const player = { x: 0, y: 8.5, z: 0 };
  const pickup = createPickup('stone', { x: 3, y: 8, z: 0 });
  const inventory = createInventory();

  assert.equal(tryStartPickup(pickup, player), false);
  advancePickup(pickup, player, 1);
  assert.equal(pickup.pickingUp, false);
  assert.equal(pickup.collected, false);
  assert.equal(collectPickup(inventory, pickup), false);
  assert.equal(inventory.stone, 0);
});
