const THREE = window.THREE;
const { createIsland, PLAYER_CONFIG } = window.SkyIslandStep0;
const { MINING_TIMES, createMiningState, beginMining, advanceMining, releaseMining } = window.SkyIslandStep1;
const { createDrop, advanceDrop } = window.SkyIslandStep2;
const {
  createPickup,
  tryStartPickup,
  advancePickup,
  createInventory,
  collectPickup,
} = window.SkyIslandStep3;
const {
  createPlacementState,
  selectTypeByKey,
  isPlacementButton,
  placeBlock,
} = window.SkyIslandStep4;
const SkyIslandTextures = window.SkyIslandTextures;
const canvas = document.querySelector('#game');
const fpsElement = document.querySelector('#fps');
const dirtCountElement = document.querySelector('#dirt-count');
const stoneCountElement = document.querySelector('#stone-count');
const dirtSlotElement = document.querySelector('#dirt-slot');
const stoneSlotElement = document.querySelector('#stone-slot');

if (!THREE) {
  document.body.innerHTML = '<div class="runtime-error">three.js 載入失敗，請確認專案內的 vendor/three.min.js 存在。</div>';
  throw new Error('three.js failed to load from the local vendor file');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fc9e8);
scene.fog = new THREE.Fog(0x8fc9e8, 35, 90);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 150);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xdff6ff, 0x486078, 2.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-12, 25, 10);
scene.add(sun);

const island = createIsland();
const textureLoader = new THREE.TextureLoader();
const textureRoot = './sky-island-assets/sky-island-assets/textures/16px/';
// The file names above document the source asset pack; data URIs make direct file:// launch reliable.
// Source files: grass_top.png, grass_side.png, dirt.png, stone.png
const textures = {
  grassTop: textureLoader.load(SkyIslandTextures.grassTop),
  grassSide: textureLoader.load(SkyIslandTextures.grassSide),
  dirt: textureLoader.load(SkyIslandTextures.dirt),
  stone: textureLoader.load(SkyIslandTextures.stone),
  cracks: textureLoader.load(SkyIslandTextures.cracks),
};
Object.values(textures).forEach((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
});
textures.cracks.wrapS = THREE.ClampToEdgeWrapping;
textures.cracks.wrapT = THREE.ClampToEdgeWrapping;
textures.cracks.repeat.set(0.1, 1);

const grassSideMaterial = new THREE.MeshLambertMaterial({ map: textures.grassSide });
const grassTopMaterial = new THREE.MeshLambertMaterial({ map: textures.grassTop });
const dirtMaterial = new THREE.MeshLambertMaterial({ map: textures.dirt });
const materials = {
  grass: [
    grassSideMaterial,
    grassSideMaterial,
    grassTopMaterial,
    dirtMaterial,
    grassSideMaterial,
    grassSideMaterial,
  ],
  dirt: dirtMaterial,
  stone: new THREE.MeshLambertMaterial({ map: textures.stone }),
};
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
const droppedItems = [];
const inventory = createInventory();
const placement = createPlacementState();
const placedBlockMeshes = [];

function spawnDroppedBlock(block) {
  const drop = createDrop(block.type, block, island.height);
  const mesh = new THREE.Mesh(blockGeometry, materials[block.type]);
  mesh.scale.setScalar(drop.size);
  mesh.position.set(drop.position.x, drop.position.y, drop.position.z);
  mesh.userData.drop = drop;
  mesh.userData.pickup = createPickup(block.type, drop.position);
  scene.add(mesh);
  droppedItems.push({ drop, pickup: mesh.userData.pickup, mesh });
}

function updateDroppedBlocks(delta) {
  for (const item of droppedItems) {
    advanceDrop(item.drop, delta);
    if (!item.pickup.pickingUp && !item.pickup.collected) {
      item.pickup.position.x = item.drop.position.x;
      item.pickup.position.y = item.drop.position.y;
      item.pickup.position.z = item.drop.position.z;
      tryStartPickup(item.pickup, player.position);
    }
    if (item.pickup.pickingUp) {
      advancePickup(item.pickup, player.position, delta);
      item.mesh.position.set(item.pickup.position.x, item.pickup.position.y, item.pickup.position.z);
    } else {
      item.mesh.position.set(item.drop.position.x, item.drop.position.y, item.drop.position.z);
    }
    item.mesh.rotation.set(item.drop.rotation.x, item.drop.rotation.y, item.drop.rotation.z);
    if (item.pickup.collected) {
      collectPickup(inventory, item.pickup);
      scene.remove(item.mesh);
    }
  }
  dirtCountElement.textContent = String(inventory.dirt);
  stoneCountElement.textContent = String(inventory.stone);
  dirtSlotElement.classList.toggle('selected', placement.selectedType === 'dirt');
  stoneSlotElement.classList.toggle('selected', placement.selectedType === 'stone');
}

const blockGroup = new THREE.Group();
const blocksByType = new Map();
for (const block of island.blocks) {
  if (!blocksByType.has(block.type)) blocksByType.set(block.type, []);
  blocksByType.get(block.type).push(block);
}
for (const [type, blocks] of blocksByType) {
  const mesh = new THREE.InstancedMesh(blockGeometry, materials[type], blocks.length);
  const matrix = new THREE.Matrix4();
  blocks.forEach((block, index) => {
    matrix.makeTranslation(block.x, block.y + 0.5, block.z);
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.userData.type = type;
  mesh.userData.blocks = blocks;
  blockGroup.add(mesh);
}
scene.add(blockGroup);

const miningMeshes = blockGroup.children.filter((mesh) => Object.hasOwn(MINING_TIMES, mesh.userData.type));
const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);
const mining = createMiningState();
const miningOverlay = new THREE.Mesh(
  blockGeometry,
  new THREE.MeshBasicMaterial({
    map: textures.cracks,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  }),
);
miningOverlay.scale.setScalar(1.02);
miningOverlay.visible = false;
scene.add(miningOverlay);
let miningHeld = false;
let miningTarget = null;

const player = {
  position: new THREE.Vector3(0, 9.8, 6),
  velocityY: 0,
  grounded: false,
  yaw: 0,
  pitch: PLAYER_CONFIG.initialPitch,
};
const keys = new Set();

function groundHeightAt(x, z) {
  const inside = x >= -island.width / 2 && x < island.width / 2 && z >= -island.depth / 2 && z < island.depth / 2;
  return inside ? island.height : -Infinity;
}

function updateCamera() {
  camera.position.set(player.position.x, player.position.y, player.position.z);
  camera.rotation.x = player.pitch;
  camera.rotation.y = player.yaw;
}

function raycastBlock() {
  raycaster.setFromCamera(screenCenter, camera);
  const targets = [...miningMeshes, ...placedBlockMeshes];
  const [hit] = raycaster.intersectObjects(targets, false);
  if (!hit) return null;
  const block = blockFromIntersection(hit);
  if (!block || block.removed) return null;
  return {
    mesh: hit.object,
    instanceId: Number.isInteger(hit.instanceId) ? hit.instanceId : null,
    block,
    id: `${block.type}:${block.x}:${block.y}:${block.z}`,
  };
}

function updateMiningOverlay() {
  if (!miningTarget || mining.crackStage < 0) {
    miningOverlay.visible = false;
    return;
  }
  miningOverlay.position.set(
    miningTarget.block.x,
    miningTarget.block.y + 0.5,
    miningTarget.block.z,
  );
  textures.cracks.offset.x = mining.crackStage * 0.1;
  miningOverlay.visible = true;
}

function removeMinedBlock() {
  if (!miningTarget) return;
  miningTarget.block.removed = true;
  spawnDroppedBlock(miningTarget.block);
  if (Number.isInteger(miningTarget.instanceId)) {
    const invisible = new THREE.Matrix4().makeScale(0, 0, 0);
    miningTarget.mesh.setMatrixAt(miningTarget.instanceId, invisible);
    miningTarget.mesh.instanceMatrix.needsUpdate = true;
  } else {
    const index = placedBlockMeshes.indexOf(miningTarget.mesh);
    if (index >= 0) placedBlockMeshes.splice(index, 1);
    scene.remove(miningTarget.mesh);
  }
  miningHeld = false;
  miningTarget = null;
  releaseMining(mining);
  updateMiningOverlay();
}

function blockFromIntersection(hit) {
  if (hit.instanceId !== undefined && hit.object.userData.blocks) {
    return hit.object.userData.blocks[hit.instanceId];
  }
  return hit.object.userData.block || null;
}

function raycastPlacementTarget() {
  raycaster.setFromCamera(screenCenter, camera);
  const targets = [...blockGroup.children, ...placedBlockMeshes];
  const [hit] = raycaster.intersectObjects(targets, false);
  if (!hit || !hit.face) return null;
  const block = blockFromIntersection(hit);
  if (!block || block.removed) return null;
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  normal.set(Math.round(normal.x), Math.round(normal.y), Math.round(normal.z));
  return { block, normal };
}

function placeSelectedBlock() {
  const target = raycastPlacementTarget();
  if (!target) return;
  const placed = placeBlock(inventory, island.blocks, placement.selectedType, target.block, target.normal);
  if (!placed) return;
  const mesh = new THREE.Mesh(blockGeometry, materials[placed.type]);
  mesh.position.set(placed.x, placed.y + 0.5, placed.z);
  mesh.userData.block = placed;
  scene.add(mesh);
  placedBlockMeshes.push(mesh);
  dirtCountElement.textContent = String(inventory.dirt);
  stoneCountElement.textContent = String(inventory.stone);
}

function onMouseDown(event) {
  if (isPlacementButton(event.button)) {
    event.preventDefault();
    placeSelectedBlock();
    return;
  }
  if (event.button !== 0) return;
  const target = raycastBlock();
  if (!target) return;
  event.preventDefault();
  miningHeld = true;
  miningTarget = target;
  beginMining(mining, target.id, target.block.type);
  updateMiningOverlay();
}

function onMouseUp(event) {
  if (event.button !== 0 || !miningHeld) return;
  miningHeld = false;
  if (!mining.completed) {
    releaseMining(mining);
    miningTarget = null;
    updateMiningOverlay();
  }
}

function movePlayer(delta) {
  const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
  const strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
  const direction = new THREE.Vector3(strafe, 0, -forward);
  if (direction.lengthSq() > 0) {
    direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
    player.position.addScaledVector(direction, PLAYER_CONFIG.moveSpeed * delta);
  }

  player.velocityY -= PLAYER_CONFIG.gravity * delta;
  player.position.y += player.velocityY * delta;
  const floor = groundHeightAt(player.position.x, player.position.z) + PLAYER_CONFIG.eyeHeight;
  if (floor !== -Infinity && player.position.y <= floor) {
    player.position.y = floor;
    player.velocityY = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }
  updateCamera();
}

function onKeyDown(event) {
  keys.add(event.code);
  selectTypeByKey(placement, inventory, event.code, event.key);
  if (event.code === 'Space' && player.grounded) {
    player.velocityY = PLAYER_CONFIG.jumpVelocity;
    player.grounded = false;
  }
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Digit1', 'Digit2'].includes(event.code)) event.preventDefault();
}

function onKeyUp(event) {
  keys.delete(event.code);
}

canvas.addEventListener('click', () => canvas.requestPointerLock());
canvas.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});
document.addEventListener('pointerlockchange', () => {
  canvas.classList.toggle('locked', document.pointerLockElement === canvas);
});
document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement !== canvas) return;
  player.yaw -= event.movementX * 0.0022;
  player.pitch -= event.movementY * 0.0022;
  player.pitch = THREE.MathUtils.clamp(player.pitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
  updateCamera();
});
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.addEventListener('blur', () => keys.clear());
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});

updateCamera();
let lastTime = performance.now();
let fpsFrames = 0;
let fpsTime = lastTime;

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  movePlayer(delta);
  updateDroppedBlocks(delta);
  if (miningHeld && miningTarget) {
    advanceMining(mining, delta);
    updateMiningOverlay();
    if (mining.completed) removeMinedBlock();
  }
  renderer.render(scene, camera);
  fpsFrames += 1;
  if (now - fpsTime >= 500) {
    fpsElement.textContent = `FPS: ${Math.round((fpsFrames * 1000) / (now - fpsTime))}`;
    fpsFrames = 0;
    fpsTime = now;
  }
}

requestAnimationFrame(animate);
