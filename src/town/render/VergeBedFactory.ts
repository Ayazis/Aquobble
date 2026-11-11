import * as THREE from 'three';
import type { VergeBed } from '../layout/placeVergeBeds';

/** Petal colours for clumps and planters (a bed's variant picks one). */
const PETALS = [0xf2d65a, 0xf4f0ea, 0xc77dd6, 0xe0605a, 0x7f9ef0, 0xf09a4a];
const BLOOMS_PER_CLUMP = 7;
const BLOOMS_PER_PLANTER = 6;
/** Planter box outer size (m). */
const BOX = { width: 1.1, height: 0.38, depth: 0.45 };

/** Builds the verge beds as a few instanced meshes in town-local space (y = 0 is the levelled town ground). */
export class VergeBedFactory {
  create(beds: readonly VergeBed[]): THREE.Group {
    const group = new THREE.Group();
    group.name = 'verge-beds';
    const planters = beds.filter((b) => b.kind === 'planter');
    const blooms = beds.flatMap((b) => bloomsOf(b));
    if (planters.length > 0) group.add(this.boxes(planters));
    if (blooms.length > 0) group.add(this.blooms(blooms));
    return group;
  }

  private boxes(planters: readonly VergeBed[]): THREE.InstancedMesh {
    const geometry = new THREE.BoxGeometry(BOX.width, BOX.height, BOX.depth).translate(0, BOX.height / 2, 0);
    const material = new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.9, flatShading: true });
    const mesh = new THREE.InstancedMesh(geometry, material, planters.length);
    const m = new THREE.Matrix4();
    const turn = new THREE.Quaternion();
    planters.forEach((p, i) => {
      turn.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.facing);
      mesh.setMatrixAt(i, m.compose(new THREE.Vector3(p.x, 0, p.z), turn, new THREE.Vector3(1, 1, 1)));
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private blooms(blooms: readonly Bloom[]): THREE.InstancedMesh {
    const stem = new THREE.CylinderGeometry(0.012, 0.016, 1, 3).translate(0, 0.5, 0);
    const head = new THREE.OctahedronGeometry(0.09, 0).scale(1, 0.55, 1).translate(0, 1, 0);
    const geometry = mergeGeometries(stem, head);
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true });
    const mesh = new THREE.InstancedMesh(geometry, material, blooms.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const colour = new THREE.Color();
    blooms.forEach((b, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.yaw);
      mesh.setMatrixAt(i, m.compose(new THREE.Vector3(b.x, b.y, b.z), q, new THREE.Vector3(1, b.height, 1)));
      mesh.setColorAt(i, colour.setHex(b.colour));
    });
    mesh.receiveShadow = true;
    return mesh;
  }
}

interface Bloom {
  x: number;
  y: number;
  z: number;
  yaw: number;
  height: number;
  colour: number;
}

/** A small deterministic hash in [0, 1) so blooms vary without drawing more random numbers. */
const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function bloomsOf(bed: VergeBed): Bloom[] {
  const planter = bed.kind === 'planter';
  const count = planter ? BLOOMS_PER_PLANTER : BLOOMS_PER_CLUMP;
  const [ax, az] = [Math.cos(bed.facing), -Math.sin(bed.facing)];
  const blooms: Bloom[] = [];
  for (let i = 0; i < count; i++) {
    const seed = bed.variant * 1000 + i;
    const along = planter ? (i / (count - 1) - 0.5) * (BOX.width - 0.2) : (hash(seed) - 0.5) * 0.9;
    const across = planter ? (hash(seed + 7) - 0.5) * 0.2 : (hash(seed + 7) - 0.5) * 0.6;
    const pick = Math.floor(bed.variant * PETALS.length + (hash(seed + 3) < 0.25 ? 1 : 0)) % PETALS.length;
    blooms.push({
      x: bed.x + ax * along - az * across,
      y: planter ? BOX.height - 0.04 : 0,
      z: bed.z + az * along + ax * across,
      yaw: hash(seed + 11) * Math.PI * 2,
      height: (planter ? 0.25 : 0.3) + hash(seed + 5) * 0.15,
      colour: PETALS[pick],
    });
  }
  return blooms;
}

/** Stem (green) and head (white, tinted by the instance colour) merged with vertex colours. */
function mergeGeometries(stem: THREE.BufferGeometry, head: THREE.BufferGeometry): THREE.BufferGeometry {
  const parts = [stem.toNonIndexed(), head.toNonIndexed()];
  const tints = [new THREE.Color(0x3f7a2e).multiplyScalar(0.5), new THREE.Color(1, 1, 1)];
  const positions = parts.flatMap((g) => Array.from(g.getAttribute('position').array));
  const colours = parts.flatMap((g, k) =>
    Array.from({ length: g.getAttribute('position').count }, () => tints[k].toArray()).flat(),
  );
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  merged.computeVertexNormals();
  return merged;
}
