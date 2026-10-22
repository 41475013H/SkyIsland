import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const step0Source = readFileSync(new URL('../src/step0.js', import.meta.url), 'utf8');
const step0Context = {};
vm.runInNewContext(step0Source, step0Context);
const { WORLD_LIMIT, PLAYER_CONFIG, createIsland } = step0Context.SkyIslandStep0;

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

test('STEP 0：入口頁面使用專案內的 three.js，不依賴 CDN', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /src="\.\/vendor\/three\.min\.js"/);
  assert.doesNotMatch(html, /cdn\.jsdelivr\.net|unpkg\.com/);
});

test('STEP 0：直接開啟 index.html 時不依賴本機 ES module 載入', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(html, /type="module"/);
  assert.match(html, /src="\.\/src\/step0\.js"><\/script>/);
  assert.match(html, /src="\.\/src\/main\.js"><\/script>/);
});

test('STEP 0：初始視角朝向小島，而不是朝天空', () => {
  assert.ok(PLAYER_CONFIG.initialPitch > 0);
});
