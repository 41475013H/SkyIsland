import { createIsland, PLAYER_CONFIG } from './step0.js';

const THREE = window.THREE;
const canvas = document.querySelector('#game');
const fpsElement = document.querySelector('#fps');

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
const textureRoot = '../sky-island-assets/sky-island-assets/textures/16px/';
const textures = {
  grass: textureLoader.load(`${textureRoot}grass_side.png`),
  dirt: textureLoader.load(`${textureRoot}dirt.png`),
  stone: textureLoader.load(`${textureRoot}stone.png`),
};
Object.values(textures).forEach((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
});

const materials = {
  grass: new THREE.MeshLambertMaterial({ map: textures.grass }),
  dirt: new THREE.MeshLambertMaterial({ map: textures.dirt }),
  stone: new THREE.MeshLambertMaterial({ map: textures.stone }),
};
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
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
  blockGroup.add(mesh);
}
scene.add(blockGroup);

const player = {
  position: new THREE.Vector3(0, 9.8, 6),
  velocityY: 0,
  grounded: false,
  yaw: 0,
  pitch: -0.18,
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
  if (event.code === 'Space' && player.grounded) {
    player.velocityY = PLAYER_CONFIG.jumpVelocity;
    player.grounded = false;
  }
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(event.code)) event.preventDefault();
}

function onKeyUp(event) {
  keys.delete(event.code);
}

canvas.addEventListener('click', () => canvas.requestPointerLock());
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
  renderer.render(scene, camera);
  fpsFrames += 1;
  if (now - fpsTime >= 500) {
    fpsElement.textContent = `FPS: ${Math.round((fpsFrames * 1000) / (now - fpsTime))}`;
    fpsFrames = 0;
    fpsTime = now;
  }
}

requestAnimationFrame(animate);
