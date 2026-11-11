import * as THREE from 'three';

/** Name of the node holding the windmill's sails once split off (pivoting at the hub, turning about local +y). */
export const SAILS_NODE = 'sails';

/**
 * The windmill model's sails, in its mesh's own (z-up) space: every connected part lying wholly in the thin
 * slab in front of the cap (-y) above the ground. Measured from public/assets/models/town/windmill.glb.
 */
const SLAB = { minY: -0.4, maxY: -0.29, minZ: -0.2 };

/** Per vertex, the id (lowest vertex index) of the connected part it belongs to. */
export function connectedParts(index: ArrayLike<number>, count: number): Int32Array {
  const parent = new Int32Array(count).map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]];
    return x;
  };
  for (let t = 0; t + 2 < index.length; t += 3) {
    const a = find(index[t]);
    for (const v of [index[t + 1], index[t + 2]]) {
      const b = find(v);
      if (a !== b) parent[Math.max(a, b)] = Math.min(a, b);
    }
  }
  return parent.map((_, i) => find(i));
}

/**
 * Splits the windmill's sails off into their own mesh, a child of the original mesh named `SAILS_NODE`,
 * positioned at the hub so turning it about its local y axis spins the sails. Returns false if no sails found.
 */
export function splitSails(model: THREE.Object3D): boolean {
  const mesh = findMesh(model);
  const geometry = mesh?.geometry;
  const index = geometry?.getIndex();
  if (!mesh || !geometry || !index || model.getObjectByName(SAILS_NODE)) return false;
  const pos = geometry.getAttribute('position');
  const parts = connectedParts(index.array, pos.count);
  const outside = new Set<number>();
  for (let i = 0; i < pos.count; i++) {
    const [y, z] = [pos.getY(i), pos.getZ(i)];
    if (y < SLAB.minY || y > SLAB.maxY || z < SLAB.minZ) outside.add(parts[i]);
  }
  const keep: number[] = [];
  const sail: number[] = [];
  for (let t = 0; t < index.count; t += 3) {
    (outside.has(parts[index.getX(t)]) ? keep : sail).push(index.getX(t), index.getX(t + 1), index.getX(t + 2));
  }
  if (sail.length === 0) return false;

  const hub = new THREE.Box3();
  for (const v of sail) hub.expandByPoint(new THREE.Vector3(pos.getX(v), pos.getY(v), pos.getZ(v)));
  const centre = hub.getCenter(new THREE.Vector3());
  const sailGeometry = subset(geometry, sail).translate(-centre.x, -centre.y, -centre.z);
  geometry.setIndex(keep);
  const sails = new THREE.Mesh(sailGeometry, mesh.material);
  sails.name = SAILS_NODE;
  sails.position.copy(centre);
  mesh.add(sails);
  return true;
}

function findMesh(model: THREE.Object3D): THREE.Mesh | undefined {
  let found: THREE.Mesh | undefined;
  model.traverse((o) => {
    if (!found && (o as THREE.Mesh).isMesh) found = o as THREE.Mesh;
  });
  return found;
}

/** A float copy of the geometry holding only the given triangles (vertices re-indexed). */
function subset(geometry: THREE.BufferGeometry, triangles: readonly number[]): THREE.BufferGeometry {
  const remap = new Map<number, number>();
  for (const v of triangles) if (!remap.has(v)) remap.set(v, remap.size);
  const out = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(geometry.attributes)) {
    const data = new Float32Array(remap.size * attr.itemSize);
    for (const [from, to] of remap) {
      for (let k = 0; k < attr.itemSize; k++) data[to * attr.itemSize + k] = attr.getComponent(from, k);
    }
    out.setAttribute(name, new THREE.BufferAttribute(data, attr.itemSize));
  }
  out.setIndex(triangles.map((v) => remap.get(v) ?? 0));
  return out;
}
