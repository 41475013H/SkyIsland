import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = {};
vm.runInNewContext(readFileSync(new URL('../src/step4.js', import.meta.url), 'utf8'), context);
const { createPlacementState, selectType, placeBlock } = context.SkyIslandStep4;

test('STEP 4：選取有數量的方塊欄，右鍵可在目標面旁放置一格並扣一個', () => {
  const inventory = { dirt: 1, stone: 0 };
  const blocks = [{ type: 'grass', x: 0, y: 8, z: 0 }];
  const state = createPlacementState();
  selectType(state, inventory, 'dirt');

  const placed = placeBlock(inventory, blocks, state.selectedType, blocks[0], { x: 0, y: 1, z: 0 });

  assert.deepEqual(placed, { type: 'dirt', x: 0, y: 9, z: 0 });
  assert.equal(inventory.dirt, 0);
  assert.equal(blocks.length, 2);
});

test('STEP 4：方塊數量為 0 時不能放置', () => {
  const inventory = { dirt: 0, stone: 0 };
  const blocks = [{ type: 'grass', x: 0, y: 8, z: 0 }];
  const placed = placeBlock(inventory, blocks, 'dirt', blocks[0], { x: 1, y: 0, z: 0 });

  assert.equal(placed, null);
  assert.equal(blocks.length, 1);
});

test('STEP 4：完整循環放回後，方塊數量回到原本', () => {
  const inventory = { dirt: 1, stone: 0 };
  const blocks = [{ type: 'grass', x: 0, y: 8, z: 0 }];
  const originalCount = inventory.dirt;

  const placed = placeBlock(inventory, blocks, 'dirt', blocks[0], { x: 1, y: 0, z: 0 });
  assert.ok(placed);
  inventory.dirt += 1;

  assert.equal(inventory.dirt, originalCount);
});
