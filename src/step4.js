(function exposeStep4(global) {
  const WORLD_LIMIT = 32;

  function createPlacementState() {
    return { selectedType: 'dirt' };
  }

  function selectType(state, inventory, type) {
    if (inventory[type] === undefined) return false;
    state.selectedType = type;
    return true;
  }

  function selectTypeByKey(state, inventory, code, key) {
    const typeByKey = {
      Digit1: 'dirt',
      Digit2: 'stone',
      1: 'dirt',
      2: 'stone',
    };
    const type = typeByKey[code] || typeByKey[key];
    return type ? selectType(state, inventory, type) : false;
  }

  function isPlacementButton(button) {
    return button === 2;
  }

  function isInsideWorld(block) {
    return block.x >= -WORLD_LIMIT / 2
      && block.x < WORLD_LIMIT / 2
      && block.y >= 0
      && block.y < WORLD_LIMIT
      && block.z >= -WORLD_LIMIT / 2
      && block.z < WORLD_LIMIT / 2;
  }

  function samePosition(first, second) {
    return first.x === second.x && first.y === second.y && first.z === second.z;
  }

  function placeBlock(inventory, blocks, type, target, normal) {
    if (inventory[type] === undefined || inventory[type] <= 0) return null;
    const destination = {
      type,
      x: target.x + Math.round(normal.x),
      y: target.y + Math.round(normal.y),
      z: target.z + Math.round(normal.z),
    };
    if (!isInsideWorld(destination)) return null;
    if (blocks.some((block) => !block.removed && samePosition(block, destination))) return null;
    inventory[type] -= 1;
    blocks.push(destination);
    return destination;
  }

  global.SkyIslandStep4 = Object.freeze({
    createPlacementState,
    selectType,
    selectTypeByKey,
    isPlacementButton,
    placeBlock,
  });
})(typeof window !== 'undefined' ? window : globalThis);
