import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = {};
vm.runInNewContext(readFileSync(new URL('../src/step4.js', import.meta.url), 'utf8'), context);
const { createPlacementState, selectTypeByKey, isPlacementButton } = context.SkyIslandStep4;

test('STEP 4 修正：數字鍵 1/2 都能選取對應方塊', () => {
  const state = createPlacementState();
  const inventory = { dirt: 1, stone: 1 };

  assert.equal(selectTypeByKey(state, inventory, 'Digit2', '2'), true);
  assert.equal(state.selectedType, 'stone');
  assert.equal(selectTypeByKey(state, inventory, 'Digit1', '1'), true);
  assert.equal(state.selectedType, 'dirt');
});

test('STEP 4 修正：右鍵按下本身就是放置按鍵', () => {
  assert.equal(isPlacementButton(2), true);
  assert.equal(isPlacementButton(0), false);
});
