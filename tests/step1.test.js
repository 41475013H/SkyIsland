import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const step0Context = {};
vm.runInNewContext(readFileSync(new URL('../src/step0.js', import.meta.url), 'utf8'), step0Context);
const { createIsland } = step0Context.SkyIslandStep0;

const step1Context = {};
vm.runInNewContext(readFileSync(new URL('../src/step1.js', import.meta.url), 'utf8'), step1Context);
const { MINING_TIMES, createMiningState, beginMining, advanceMining, releaseMining } = step1Context.SkyIslandStep1;

test('STEP 1：初始草坪上有可挖的泥土與石頭方塊', () => {
  const island = createIsland();
  const surfaceBlocks = island.blocks.filter((block) => block.y === island.height);

  assert.ok(surfaceBlocks.some((block) => block.type === 'dirt'));
  assert.ok(surfaceBlocks.some((block) => block.type === 'stone'));
});

test('STEP 1：泥土不到 1 秒可以挖掉，石頭約 2 秒才挖掉', () => {
  assert.ok(MINING_TIMES.dirt > 0 && MINING_TIMES.dirt < 1);
  assert.ok(MINING_TIMES.stone >= 1.8 && MINING_TIMES.stone <= 2.2);

  const dirt = createMiningState();
  beginMining(dirt, 'dirt-1', 'dirt');
  advanceMining(dirt, MINING_TIMES.dirt - 0.01);
  assert.equal(dirt.completed, false);
  advanceMining(dirt, 0.02);
  assert.equal(dirt.completed, true);

  const stone = createMiningState();
  beginMining(stone, 'stone-1', 'stone');
  advanceMining(stone, MINING_TIMES.stone - 0.01);
  assert.equal(stone.completed, false);
  advanceMining(stone, 0.02);
  assert.equal(stone.completed, true);
});

test('STEP 1：放開左鍵會清除裂痕並從頭開始', () => {
  const state = createMiningState();
  beginMining(state, 'dirt-1', 'dirt');
  advanceMining(state, 0.3);
  assert.ok(state.progress > 0);

  releaseMining(state);

  assert.equal(state.targetId, null);
  assert.equal(state.progress, 0);
  assert.equal(state.crackStage, -1);
  assert.equal(state.completed, false);
});

test('STEP 1：只按一下左鍵不會直接挖掉方塊', () => {
  const state = createMiningState();
  beginMining(state, 'dirt-1', 'dirt');
  releaseMining(state);

  assert.equal(state.completed, false);
});
