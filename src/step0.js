(function exposeStep0(global) {
  const WORLD_LIMIT = 32;

  const PLAYER_CONFIG = Object.freeze({
    moveSpeed: 4,
    jumpVelocity: 6.5,
    gravity: 18,
    eyeHeight: 1.6,
    height: 1.8,
    initialPitch: 0.2,
  });

  function createIsland() {
    const width = 16;
    const depth = 16;
    const height = 8;
    const blocks = [];
    const startX = -width / 2;
    const startZ = -depth / 2;

    for (let x = 0; x < width; x += 1) {
      for (let z = 0; z < depth; z += 1) {
        for (let y = 0; y < height; y += 1) {
          let type = 'stone';
          if (y >= height - 4) type = 'dirt';
          if (y === height - 1) type = 'grass';
          blocks.push({ type, x: startX + x, y, z: startZ + z });
        }
      }
    }

    // STEP 1 的初始測試方塊：放在草坪上，方便玩家一開始就能瞄準挖掘。
    blocks.push(
      { type: 'dirt', x: -3, y: height, z: 2 },
      { type: 'stone', x: 3, y: height, z: 2 },
      { type: 'dirt', x: 0, y: height, z: -2 },
    );

    return { width, depth, height, blocks };
  }

  global.SkyIslandStep0 = Object.freeze({ WORLD_LIMIT, PLAYER_CONFIG, createIsland });
})(typeof window !== 'undefined' ? window : globalThis);
