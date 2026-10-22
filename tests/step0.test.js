import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WORLD_LIMIT,
  PLAYER_CONFIG,
  createIsland,
} from '../src/step0.js';

test('STEP 0：小島三軸範圍不超過 32 格', () => {
  const island = createIsland();

  assert.ok(island.width > 0);
  assert.ok(island.depth > 0);
  assert.ok(island.height > 0);
  assert.ok(island.width <= WORLD_LIMIT);
  assert.ok(island.depth <= WORLD_LIMIT);
  assert.ok(island.height <= WORLD_LIMIT);
});

test('STEP 0：小島包含地面、泥土與石頭方塊', () => {
  const island = createIsland();
  const blockTypes = new Set(island.blocks.map((block) => block.type));

  assert.ok(blockTypes.has('grass'));
  assert.ok(blockTypes.has('dirt'));
  assert.ok(blockTypes.has('stone'));
});

test('STEP 0：玩家設定支援水平移動與跳躍', () => {
  assert.ok(PLAYER_CONFIG.moveSpeed > 0);
  assert.ok(PLAYER_CONFIG.jumpVelocity > 0);
  assert.ok(PLAYER_CONFIG.gravity > 0);
});
