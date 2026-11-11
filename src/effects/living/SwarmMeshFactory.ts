import * as THREE from 'three';
import type { Random } from '@core';
import type { SwarmKind } from './SwarmKind';

const BUTTERFLY_COLORS = [0xf2c94c, 0xffffff, 0xe8833a, 0x8fb8ff, 0xf0a3c8];

/** Two flat wings (about 14 cm across) either side of the body axis +z. */
function wings(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const v = [0, 0, 0.03, 0.07, 0, 0.04, 0, 0, -0.03, 0, 0, 0.03, -0.07, 0, 0.04, 0, 0, -0.03];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function material(kind: SwarmKind): THREE.Material {
  if (kind === 'butterfly') return new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const color = kind === 'firefly' ? new THREE.Color(1.6, 2.2, 0.5) : new THREE.Color(1, 0.92, 0.7);
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: kind === 'firefly' ? 1 : 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

/** Builds one InstancedMesh per swarm: coloured wings, glowing firefly specks, or faint dust motes. */
export class SwarmMeshFactory {
  constructor(private readonly random: Random) {}

  create(kind: SwarmKind, count: number): THREE.InstancedMesh {
    const geometry =
      kind === 'butterfly' ? wings() : new THREE.OctahedronGeometry(kind === 'firefly' ? 0.045 : 0.012, 0);
    const mesh = new THREE.InstancedMesh(geometry, material(kind), count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    if (kind === 'butterfly') {
      const color = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const pick = BUTTERFLY_COLORS[Math.floor(this.random.next() * BUTTERFLY_COLORS.length)] ?? 0xffffff;
        mesh.setColorAt(i, color.setHex(pick));
      }
    }
    return mesh;
  }
}
