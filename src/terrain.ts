import * as THREE from 'three';

// Cheap value-noise; swap for a proper simplex noise later.
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, u), THREE.MathUtils.lerp(c, d, u), v);
}
function fbm(x: number, y: number) {
  let sum = 0, amp = 1, freq = 1;
  for (let i = 0; i < 5; i++) {
    sum += noise(x * freq, y * freq) * amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum;
}

const palette = [
  { h: 1.0, c: new THREE.Color(0xd9c28a) }, // sand
  { h: 6, c: new THREE.Color(0x7aa35a) }, // grass
  { h: 14, c: new THREE.Color(0x4f7d45) }, // forest
  { h: 22, c: new THREE.Color(0x8a7d6b) }, // rock
  { h: Infinity, c: new THREE.Color(0xf2f2f2) }, // snow
];

/** Flat-shaded low-poly terrain with per-face vertex colours, plus a water plane. */
export function createTerrain() {
  const size = 200, seg = 80;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2).toNonIndexed();
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const r = Math.hypot(x, z) / (size / 2);
    const h = fbm(x * 0.02 + 10, z * 0.02 + 10) * 32 - 12 - r * r * 18;
    pos.setY(i, h);
  }
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i += 3) {
    const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const c = palette.find((p) => y < p.h)!.c;
    for (let k = 0; k < 3; k++) c.toArray(colors, (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const land = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }),
  );
  land.castShadow = land.receiveShadow = true;

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x2f6f8f, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 }),
  );
  water.position.y = 0.2;
  water.receiveShadow = true;

  const group = new THREE.Group();
  group.add(land, water);
  return group;
}
