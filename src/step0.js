export const WORLD_LIMIT = 32;

export const PLAYER_CONFIG = Object.freeze({
  moveSpeed: 4,
  jumpVelocity: 6.5,
  gravity: 18,
  eyeHeight: 1.6,
  height: 1.8,
  initialPitch: 0.2,
});

export function createIsland() {
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

  return { width, depth, height, blocks };
}
