(function exposeStep3(global) {
  const PICKUP_DISTANCE = 1.5;
  const FLY_DURATION = 0.35;

  function copyPosition(position) {
    return { x: position.x, y: position.y, z: position.z };
  }

  function distanceBetween(first, second) {
    return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
  }

  function createPickup(type, position) {
    return {
      type,
      position: copyPosition(position),
      startPosition: null,
      progress: 0,
      pickingUp: false,
      collected: false,
      counted: false,
    };
  }

  function tryStartPickup(pickup, playerPosition) {
    if (pickup.pickingUp || pickup.collected) return false;
    if (distanceBetween(pickup.position, playerPosition) >= PICKUP_DISTANCE) return false;
    pickup.startPosition = copyPosition(pickup.position);
    pickup.progress = 0;
    pickup.pickingUp = true;
    return true;
  }

  function advancePickup(pickup, playerPosition, deltaSeconds) {
    if (!pickup.pickingUp || pickup.collected) return;
    pickup.progress = Math.min(1, pickup.progress + Math.max(0, deltaSeconds) / FLY_DURATION);
    const easedProgress = 1 - ((1 - pickup.progress) ** 2);
    pickup.position.x = pickup.startPosition.x + (playerPosition.x - pickup.startPosition.x) * easedProgress;
    pickup.position.y = pickup.startPosition.y + (playerPosition.y - pickup.startPosition.y) * easedProgress;
    pickup.position.z = pickup.startPosition.z + (playerPosition.z - pickup.startPosition.z) * easedProgress;
    if (pickup.progress >= 1) {
      pickup.pickingUp = false;
      pickup.collected = true;
    }
  }

  function createInventory() {
    return { dirt: 0, stone: 0 };
  }

  function collectPickup(inventory, pickup) {
    if (!pickup.collected || pickup.counted || inventory[pickup.type] === undefined) return false;
    inventory[pickup.type] += 1;
    pickup.counted = true;
    return true;
  }

  global.SkyIslandStep3 = Object.freeze({
    PICKUP_DISTANCE,
    FLY_DURATION,
    createPickup,
    tryStartPickup,
    advancePickup,
    createInventory,
    collectPickup,
  });
})(typeof window !== 'undefined' ? window : globalThis);
