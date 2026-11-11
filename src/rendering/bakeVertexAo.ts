import * as THREE from 'three';
import { vertexAo } from './vertexAo';

/** Most ray-triangle tests spent on one mesh (vertices x rays x triangles); bigger meshes get fewer rays. */
const BUDGET = 25e6;
const MAX_RAYS = 6;
const MIN_RAYS = 3;
/** Ray reach as a share of the mesh's bounding-box diagonal. */
const REACH = 0.18;

/**
 * Bakes ambient occlusion into the vertex colours of every mesh under `root` (multiplying colours it
 * already has), so contact darkness shows without a depth AO pass: the phone stand-in for it. Geometry is
 * shared by clones, so bake the template models before they are placed. Meshes over budget get plain white.
 */
export function bakeVertexAo(root: THREE.Object3D, done = new Set<THREE.BufferGeometry>()): void {
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh) || node instanceof THREE.SkinnedMesh) return;
    const geometry = node.geometry as THREE.BufferGeometry;
    if (!done.has(geometry)) {
      done.add(geometry);
      bakeGeometry(geometry);
    }
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials as THREE.Material[]) {
      if ('vertexColors' in material && !material.vertexColors) {
        material.vertexColors = true;
        material.needsUpdate = true;
      }
    }
  });
}

function bakeGeometry(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position');
  if (!position) return;
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
  const normal = geometry.getAttribute('normal');
  const index = geometry.index?.array ?? Array.from({ length: position.count }, (_, i) => i);
  const work = position.count * (index.length / 3);
  const rays = Math.min(MAX_RAYS, Math.floor(BUDGET / Math.max(1, work)));
  let ao: Float32Array;
  if (rays >= MIN_RAYS && !(position instanceof THREE.InterleavedBufferAttribute)) {
    geometry.computeBoundingBox();
    const size = geometry.boundingBox?.getSize(new THREE.Vector3()).length() ?? 1;
    ao = vertexAo(position.array, normal.array, index, rays, size * REACH);
  } else {
    ao = new Float32Array(position.count).fill(1);
  }
  applyAo(geometry, ao);
}

function applyAo(geometry: THREE.BufferGeometry, ao: Float32Array): void {
  const color = geometry.getAttribute('color');
  if (!color) {
    const rgb = new Float32Array(ao.length * 3);
    ao.forEach((value, i) => rgb.fill(value, i * 3, i * 3 + 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
    return;
  }
  for (let i = 0; i < color.count; i++) {
    color.setXYZ(i, color.getX(i) * ao[i], color.getY(i) * ao[i], color.getZ(i) * ao[i]);
  }
  color.needsUpdate = true;
}
