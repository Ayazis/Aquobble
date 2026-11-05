import * as THREE from 'three';
import type { GrassPlacement } from './GrassPlacement';
import type { WindSway } from './WindSway';
import { applyWindSway } from './applyWindSway';
import { composeInstance } from './composeInstance';

/** Petal colours per variant (placement.variant indexes this, wrapping). */
const FLOWER_COLOURS = [0xf2e6a0, 0xe8e8f0, 0xc77dd6, 0xe0605a, 0x7f9ef0];

/** Builds flowers (thin stem + small low-poly head) as one instanced mesh. */
export class FlowerInstancesFactory {
  create(placements: readonly GrassPlacement[], wind: WindSway): THREE.InstancedMesh {
    const stem = new THREE.CylinderGeometry(0.008, 0.012, 0.32, 3).translate(0, 0.16, 0);
    const head = new THREE.OctahedronGeometry(0.045, 0).scale(1, 0.55, 1).translate(0, 0.33, 0);
    const geometry = mergeColoured(stem, head);
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true });
    applyWindSway(material, wind, 1.2);

    const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
    const color = new THREE.Color();
    placements.forEach((p, i) => {
      mesh.setMatrixAt(i, composeInstance(p));
      color.setHex(FLOWER_COLOURS[p.variant % FLOWER_COLOURS.length]).offsetHSL(0, 0, (p.tint - 0.5) * 0.08);
      mesh.setColorAt(i, color);
    });
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return mesh;
  }
}

/** Joins stem (green vertex colour, darkened by tint) and head (white, so the instance colour shows). */
function mergeColoured(stem: THREE.BufferGeometry, head: THREE.BufferGeometry): THREE.BufferGeometry {
  const parts = [stem.toNonIndexed(), head.toNonIndexed()];
  const tints = [new THREE.Color(0x3d6b2a), new THREE.Color(0xffffff)];
  const positions: number[] = [];
  const normals: number[] = [];
  const colours: number[] = [];
  parts.forEach((g, k) => {
    positions.push(...g.getAttribute('position').array);
    normals.push(...g.getAttribute('normal').array);
    for (let i = 0; i < g.getAttribute('position').count; i++) colours.push(tints[k].r, tints[k].g, tints[k].b);
  });
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  return merged;
}
