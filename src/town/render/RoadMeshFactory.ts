import * as THREE from 'three';
import { roadBounds } from '../layout/Bounds';
import type { TownLayout } from '../layout/TownLayout';
import { groundPatch } from './groundPatch';
import { hash2 } from './hash2';
import { valueNoise2 } from './valueNoise2';

/** Lift above the ground so the strips never z-fight with the flattened terrain. */
const LIFT = 0.06;
/** Height jitter stays well below LIFT so no vertex dips into the terrain. */
const BUMP = 0.012;

const DIRT = new THREE.Color(0x7a6450);
const DIRT_WORN = new THREE.Color(0x5e4b3b);
const DIRT_EDGE = new THREE.Color(0x6f7048);
const GRAVEL = new THREE.Color(0x9a8a74);
const COBBLE = new THREE.Color(0x8a7f72);
const COBBLE_DARK = new THREE.Color(0x5f5850);
const COBBLE_OCHRE = new THREE.Color(0x9a8360);

/** Builds packed-dirt roads and a worn cobbled square just above the ground, town-local. */
export class RoadMeshFactory {
  private readonly material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });

  create(layout: TownLayout): THREE.Group {
    const group = new THREE.Group();
    const p = layout.plazaHalfSize;
    const plaza = { minX: -p, maxX: p, minZ: -p, maxZ: p };
    group.add(this.mesh(groundPatch(plaza, LIFT + 0.02, 0.45, cobble)));
    for (const road of layout.roads) {
      const alongX = road.from.z === road.to.z;
      group.add(this.mesh(groundPatch(roadBounds(road), LIFT, 0.5, dirt(alongX))));
    }
    return group;
  }

  private mesh(geometry: THREE.BufferGeometry): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.receiveShadow = true;
    return mesh;
  }
}

/** Packed dirt: darker wheel ruts, gravel speckle, grassy soft edges. */
function dirt(alongX: boolean) {
  return (x: number, z: number, u: number, v: number) => {
    const across = alongX ? v : u; // 0..1 across the road
    const edge = Math.min(across, 1 - across) * 2; // 0 at the verge, 1 in the middle
    const rut = Math.max(0, 1 - Math.abs(Math.abs(across - 0.5) - 0.2) / 0.08);
    const n = valueNoise2(x * 0.35, z * 0.35, 1);
    const color = DIRT.clone().lerp(DIRT_WORN, rut * 0.6 + (n - 0.5) * 0.4);
    if (hash2(x * 3.1, z * 3.1, 2) > 0.8) color.lerp(GRAVEL, 0.45);
    color.lerp(DIRT_EDGE, Math.max(0, 1 - edge / 0.35) * 0.55);
    const dy = (hash2(x, z, 3) - 0.5) * BUMP - rut * BUMP * 0.5;
    return { color, dy };
  };
}

/** Worn cobbles: per-stone tint, darker joints, a trodden darker band through the middle. */
function cobble(x: number, z: number, u: number, v: number) {
  const cell = 0.45;
  const sx = Math.floor(x / cell + (Math.floor(z / cell) % 2) * 0.5);
  const sz = Math.floor(z / cell);
  const stone = hash2(sx, sz, 4);
  const color = COBBLE.clone().lerp(stone > 0.7 ? COBBLE_OCHRE : COBBLE_DARK, Math.abs(stone - 0.5) * 0.9);
  const joint = hash2(x * 5.3, z * 5.3, 5) > 0.65;
  if (joint) color.lerp(COBBLE_DARK, 0.5);
  const worn = Math.max(0, 1 - Math.min(Math.abs(u - 0.5), Math.abs(v - 0.5)) / 0.12);
  color.lerp(COBBLE_DARK, worn * 0.25 + (valueNoise2(x * 0.3, z * 0.3, 6) - 0.5) * 0.3);
  const edge = Math.min(u, 1 - u, v, 1 - v);
  if (edge < 0.02) color.lerp(COBBLE_DARK, 0.4);
  return { color, dy: joint ? -BUMP * 0.6 : (stone - 0.5) * BUMP };
}
