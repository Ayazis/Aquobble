import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { ModelPart } from './ModelPart';
import { crownCentre, roundNormals } from './roundNormals';

/** Pack colours for the untextured logs and stump, pulled towards the textured bark and the forest moss. */
const RETINT: Readonly<Record<string, number>> = {
  Wood: 0x6a4a34,
  LightWood: 0xb08c62,
  Green: 0x5d7a30,
  DarkGreen: 0x40592a,
};

/**
 * Takes the meshes under `node` apart into parts with their transforms baked in. Textured materials stay
 * one part each (leaves get alpha-tested instead of blended, so instances need no sorting); untextured
 * pieces are merged into one vertex-coloured part (one draw per log), lifted so they sit on y = 0.
 */
export function modelParts(node: THREE.Object3D): ModelPart[] {
  node.updateWorldMatrix(true, true);
  const textured: ModelPart[] = [];
  const plain: THREE.BufferGeometry[] = [];
  node.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !(child.material instanceof THREE.MeshStandardMaterial)) return;
    const source = child.material;
    const geometry = floats(child.geometry as THREE.BufferGeometry).applyMatrix4(child.matrixWorld);
    if (source.map) {
      const leaves = /leaf|leaves/i.test(source.name);
      const material = source.clone();
      material.metalness = 0;
      material.roughness = 0.9;
      if (leaves) {
        material.transparent = false;
        material.alphaTest = 0.5;
        material.depthWrite = true;
        material.side = THREE.DoubleSide;
        // One rounded mass to the light, not a heap of cards each lit its own way.
        roundNormals(geometry, crownCentre(geometry));
      }
      textured.push({ geometry, material, role: leaves ? 'leaves' : 'wood' });
      return;
    }
    plain.push(painted(geometry, new THREE.Color(RETINT[source.name.trim()] ?? source.color)));
  });
  if (plain.length === 0) return textured;
  const merged = mergeGeometries(plain);
  merged.computeBoundingBox();
  merged.translate(0, -(merged.boundingBox?.min.y ?? 0) - 0.06, 0);
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 });
  return [...textured, { geometry: merged, material, role: 'wood' }];
}

/** A copy with every attribute as plain floats: the packed (quantised) ones would clip once transformed. */
function floats(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(source.index ? source.index.clone() : null);
  for (const [name, attribute] of Object.entries(source.attributes)) {
    const { count, itemSize } = attribute;
    const array = new Float32Array(count * itemSize);
    for (let i = 0; i < count; i++)
      for (let k = 0; k < itemSize; k++) array[i * itemSize + k] = attribute.getComponent(i, k);
    geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize));
  }
  return geometry;
}

/** Keeps position and normal only, plus a flat vertex colour, so pieces with different layouts merge. */
function painted(source: THREE.BufferGeometry, color: THREE.Color): THREE.BufferGeometry {
  const flat = source.index ? source.toNonIndexed() : source;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', flat.attributes.position);
  geometry.setAttribute('normal', flat.attributes.normal);
  const colors = new Float32Array(flat.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) colors.set([color.r, color.g, color.b], i);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}
