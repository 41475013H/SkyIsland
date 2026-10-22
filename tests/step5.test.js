import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = {};
vm.runInNewContext(readFileSync(new URL('../src/step5.js', import.meta.url), 'utf8'), context);
const { CLOUD_CONFIG, createClouds, advanceClouds } = context.SkyIslandStep5;

test('STEP 5：雲霧分布在小島外圍，包含近、中、遠三種距離與不同高度', () => {
  const clouds = createClouds();
  const bands = new Set(clouds.map((cloud) => cloud.distanceBand));
  const heights = new Set(clouds.map((cloud) => cloud.position.y));

  assert.ok(clouds.length >= 6 && clouds.length <= CLOUD_CONFIG.maxClouds);
  assert.deepEqual([...bands].sort(), ['far', 'mid', 'near']);
  assert.ok(heights.size >= 3);
  for (const cloud of clouds) {
    assert.ok(Math.hypot(cloud.position.x, cloud.position.z) >= CLOUD_CONFIG.minimumIslandDistance);
    assert.ok(cloud.opacity > 0 && cloud.opacity < 1);
    assert.ok(cloud.puffs.length >= 3);
  }
});

test('STEP 5：雲霧會自行緩慢飄動，且不會突然跳動', () => {
  const clouds = createClouds();
  const before = clouds.map((cloud) => ({ x: cloud.position.x, z: cloud.position.z }));

  advanceClouds(clouds, 3);

  assert.ok(clouds.some((cloud, index) => cloud.position.x !== before[index].x || cloud.position.z !== before[index].z));
  for (const cloud of clouds) {
    assert.ok(Math.abs(cloud.position.x - before[clouds.indexOf(cloud)].x) < 2);
    assert.ok(Math.abs(cloud.position.z - before[clouds.indexOf(cloud)].z) < 2);
    assert.ok(cloud.position.y >= CLOUD_CONFIG.minimumHeight);
  }
});

test('STEP 5：雲霧使用透明白色幾何設定，不引用外部圖片或素材', () => {
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.match(main, /MeshBasicMaterial\(\{ color: 0xffffff, transparent: true/);
  assert.match(main, /SphereGeometry/);
  assert.match(main, /advanceClouds\(cloudModels, delta\)/);
  assert.doesNotMatch(main, /cloud.*TextureLoader/i);
});
