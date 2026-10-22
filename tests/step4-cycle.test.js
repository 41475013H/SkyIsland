import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const load = (path) => {
  const context = {};
  vm.runInNewContext(readFileSync(new URL(path, import.meta.url), 'utf8'), context);
  return context;
};

const step2 = load('../src/step2.js').SkyIslandStep2;
const step3 = load('../src/step3.js').SkyIslandStep3;
const step4 = load('../src/step4.js').SkyIslandStep4;

test('STEP 4 回歸：放回去的方塊可以再次掉落、撿取與放回', () => {
  const inventory = { dirt: 1, stone: 0 };
  const blocks = [{ type: 'grass', x: 0, y: 8, z: 0 }];

  const firstPlaced = step4.placeBlock(inventory, blocks, 'dirt', blocks[0], { x: 1, y: 0, z: 0 });
  assert.ok(firstPlaced);
  assert.equal(inventory.dirt, 0);

  const drop = step2.createDrop(firstPlaced.type, firstPlaced, 8);
  for (let time = 0; time < 5 && !drop.landed; time += 1 / 60) step2.advanceDrop(drop, 1 / 60);
  const pickup = step3.createPickup(firstPlaced.type, drop.position);
  assert.equal(step3.tryStartPickup(pickup, { x: 1, y: 8.5, z: 0 }), true);
  step3.advancePickup(pickup, { x: 1, y: 8.5, z: 0 }, 1);
  assert.equal(step3.collectPickup(inventory, pickup), true);
  assert.equal(inventory.dirt, 1);

  const secondPlaced = step4.placeBlock(inventory, blocks, 'dirt', blocks[0], { x: 0, y: 0, z: 1 });
  assert.ok(secondPlaced);
  assert.equal(inventory.dirt, 0);
});

test('STEP 4 回歸：放回方塊也會被主程式的挖掘射線找到並可移除', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.match(main, /\[\.\.\.miningMeshes, \.\.\.placedBlockMeshes\]/);
  assert.match(main, /scene\.remove\(miningTarget\.mesh\)/);
});
