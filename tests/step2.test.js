import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = {};
vm.runInNewContext(readFileSync(new URL('../src/step2.js', import.meta.url), 'utf8'), context);
const { DROP_CONFIG, createDrop, advanceDrop } = context.SkyIslandStep2;

test('STEP 2：挖掉方塊後會在原位置附近產生同種類小方塊並彈出旋轉', () => {
  const drop = createDrop('dirt', { x: 3, y: 8, z: -2 }, 8);
  const initialY = drop.position.y;
  const initialRotation = { ...drop.rotation };

  assert.equal(drop.type, 'dirt');
  assert.ok(Math.hypot(drop.position.x - 3, drop.position.z + 2) < 1);
  assert.equal(drop.landed, false);

  advanceDrop(drop, 0.1);

  assert.ok(drop.position.y > initialY);
  assert.notDeepEqual(drop.rotation, initialRotation);
  assert.ok(drop.size < 1);
});

test('STEP 2：小方塊落地後停住，不浮在空中也不穿過地面', () => {
  const floorY = 8;
  const drop = createDrop('stone', { x: -3, y: 8, z: 2 }, floorY);

  for (let elapsed = 0; elapsed < 5 && !drop.landed; elapsed += 1 / 60) {
    advanceDrop(drop, 1 / 60);
  }

  assert.equal(drop.landed, true);
  assert.equal(drop.velocity.y, 0);
  assert.equal(drop.position.y, floorY + DROP_CONFIG.size / 2);

  const landedPosition = { ...drop.position };
  const landedRotation = { ...drop.rotation };
  advanceDrop(drop, 1);
  assert.equal(drop.position.x, landedPosition.x);
  assert.equal(drop.position.y, landedPosition.y);
  assert.equal(drop.position.z, landedPosition.z);
  assert.equal(drop.rotation.x, landedRotation.x);
  assert.equal(drop.rotation.y, landedRotation.y);
  assert.equal(drop.rotation.z, landedRotation.z);
  assert.ok(drop.position.y >= floorY + DROP_CONFIG.size / 2);
});
