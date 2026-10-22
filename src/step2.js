(function exposeStep2(global) {
  const DROP_CONFIG = Object.freeze({
    size: 0.36,
    initialVerticalVelocity: 4.2,
    gravity: 14,
    horizontalVelocity: 0.35,
    angularVelocity: Object.freeze({ x: 1.2, y: 1.8, z: 0.9 }),
  });

  function createDrop(type, origin, floorY) {
    return {
      type,
      size: DROP_CONFIG.size,
      floorY,
      position: {
        x: origin.x,
        y: origin.y + 0.5,
        z: origin.z,
      },
      velocity: {
        x: DROP_CONFIG.horizontalVelocity,
        y: DROP_CONFIG.initialVerticalVelocity,
        z: DROP_CONFIG.horizontalVelocity * 0.5,
      },
      rotation: { x: 0, y: 0, z: 0 },
      landed: false,
    };
  }

  function advanceDrop(drop, deltaSeconds) {
    if (drop.landed) return;
    const delta = Math.max(0, deltaSeconds);
    drop.velocity.y -= DROP_CONFIG.gravity * delta;
    drop.position.x += drop.velocity.x * delta;
    drop.position.y += drop.velocity.y * delta;
    drop.position.z += drop.velocity.z * delta;
    drop.rotation.x += DROP_CONFIG.angularVelocity.x * delta;
    drop.rotation.y += DROP_CONFIG.angularVelocity.y * delta;
    drop.rotation.z += DROP_CONFIG.angularVelocity.z * delta;

    const landingY = drop.floorY + drop.size / 2;
    if (drop.position.y <= landingY) {
      drop.position.y = landingY;
      drop.velocity.x = 0;
      drop.velocity.y = 0;
      drop.velocity.z = 0;
      drop.landed = true;
    }
  }

  global.SkyIslandStep2 = Object.freeze({ DROP_CONFIG, createDrop, advanceDrop });
})(typeof window !== 'undefined' ? window : globalThis);
