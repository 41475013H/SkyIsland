(function exposeStep5(global) {
  const CLOUD_CONFIG = Object.freeze({
    maxClouds: 9,
    minimumIslandDistance: 10,
    minimumHeight: 9,
    movementLimit: 30,
  });

  const CLOUD_SPECS = [
    { distanceBand: 'near', position: { x: -13, y: 11, z: 2 }, speed: { x: 0.12, z: 0.04 }, scale: 1.1, opacity: 0.24 },
    { distanceBand: 'near', position: { x: 10, y: 12, z: -7 }, speed: { x: -0.1, z: 0.06 }, scale: 0.9, opacity: 0.22 },
    { distanceBand: 'near', position: { x: 0, y: 11, z: -12 }, speed: { x: 0.08, z: -0.11 }, scale: 0.8, opacity: 0.2 },
    { distanceBand: 'mid', position: { x: -19, y: 14, z: -9 }, speed: { x: 0.18, z: 0.05 }, scale: 1.35, opacity: 0.18 },
    { distanceBand: 'mid', position: { x: 17, y: 15, z: 11 }, speed: { x: -0.16, z: -0.07 }, scale: 1.25, opacity: 0.17 },
    { distanceBand: 'mid', position: { x: -8, y: 13, z: 21 }, speed: { x: 0.1, z: -0.14 }, scale: 1.45, opacity: 0.16 },
    { distanceBand: 'far', position: { x: 27, y: 18, z: 0 }, speed: { x: -0.2, z: 0.08 }, scale: 1.7, opacity: 0.12 },
    { distanceBand: 'far', position: { x: 4, y: 20, z: -27 }, speed: { x: 0.16, z: 0.12 }, scale: 1.55, opacity: 0.11 },
    { distanceBand: 'far', position: { x: -25, y: 17, z: 17 }, speed: { x: 0.14, z: -0.16 }, scale: 1.8, opacity: 0.1 },
  ];

  const PUFF_LAYOUTS = [
    [
      { x: -1.5, y: 0, z: 0, scale: 1.2 },
      { x: 0, y: 0.35, z: 0.1, scale: 1.55 },
      { x: 1.6, y: 0.05, z: -0.05, scale: 1.05 },
      { x: 0.6, y: -0.15, z: 0.8, scale: 0.9 },
    ],
    [
      { x: -1.3, y: 0.1, z: 0.2, scale: 1.05 },
      { x: 0.2, y: 0.45, z: 0, scale: 1.25 },
      { x: 1.4, y: 0, z: -0.2, scale: 1.35 },
    ],
    [
      { x: -1.8, y: 0, z: 0, scale: 1.4 },
      { x: -0.2, y: 0.3, z: -0.2, scale: 1.05 },
      { x: 1.3, y: 0, z: 0.2, scale: 1.5 },
      { x: 0.1, y: -0.2, z: 0.7, scale: 0.8 },
    ],
  ];

  function createClouds() {
    return CLOUD_SPECS.map((spec, index) => ({
      id: `cloud-${index + 1}`,
      distanceBand: spec.distanceBand,
      position: { ...spec.position },
      speed: { ...spec.speed },
      scale: spec.scale,
      opacity: spec.opacity,
      puffs: PUFF_LAYOUTS[index % PUFF_LAYOUTS.length].map((puff) => ({ ...puff })),
    }));
  }

  function advanceClouds(clouds, deltaSeconds) {
    const delta = Math.max(0, deltaSeconds);
    for (const cloud of clouds) {
      cloud.position.x += cloud.speed.x * delta;
      cloud.position.z += cloud.speed.z * delta;
      if (cloud.position.x > CLOUD_CONFIG.movementLimit || cloud.position.x < -CLOUD_CONFIG.movementLimit) {
        cloud.position.x = Math.max(-CLOUD_CONFIG.movementLimit, Math.min(CLOUD_CONFIG.movementLimit, cloud.position.x));
        cloud.speed.x *= -1;
      }
      if (cloud.position.z > CLOUD_CONFIG.movementLimit || cloud.position.z < -CLOUD_CONFIG.movementLimit) {
        cloud.position.z = Math.max(-CLOUD_CONFIG.movementLimit, Math.min(CLOUD_CONFIG.movementLimit, cloud.position.z));
        cloud.speed.z *= -1;
      }
    }
  }

  global.SkyIslandStep5 = Object.freeze({ CLOUD_CONFIG, createClouds, advanceClouds });
})(typeof window !== 'undefined' ? window : globalThis);
