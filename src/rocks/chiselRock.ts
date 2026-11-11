import * as THREE from 'three';
import type { Random } from '@core';

export interface ChiselOptions {
  /** Icosahedron subdivisions: 0 = 20 triangles, 1 = 80, 2 = 320. */
  detail: number;
  /** Flat cuts sliced off the lump. */
  cuts: number;
  /** Extra cuts straight across the top and bottom, at this height (for slabs). */
  capAt?: number;
}

function randomUnit(random: Random): THREE.Vector3 {
  const y = random.range(-1, 1);
  const angle = random.range(0, Math.PI * 2);
  const r = Math.sqrt(1 - y * y);
  return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
}

/**
 * A rock of about unit radius: a sphere swollen and dented by a few layered waves, then sliced by flat
 * planes so it looks split and chiselled. Every vertex moves as a function of its own position, so the
 * triangles that share it stay joined.
 */
export function chiselRock(random: Random, { detail, cuts, capAt }: ChiselOptions): THREE.BufferGeometry {
  const waves = [0, 1, 2, 3].map((octave) => ({
    axis: randomUnit(random),
    frequency: 1.4 + octave * 1.5,
    phase: random.range(0, Math.PI * 2),
    amplitude: 0.2 / (octave + 1),
  }));
  const planes = Array.from({ length: cuts }, () => ({ normal: randomUnit(random), offset: random.range(0.6, 0.9) }));
  if (capAt !== undefined) {
    planes.push({ normal: new THREE.Vector3(0, 1, 0), offset: capAt * random.range(0.8, 1.1) });
    planes.push({ normal: new THREE.Vector3(0, -1, 0), offset: capAt });
  }
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const positions = geometry.attributes.position;
  const p = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    p.fromBufferAttribute(positions, i).normalize();
    let radius = 1;
    for (const w of waves) radius += w.amplitude * Math.sin(w.frequency * p.dot(w.axis) * Math.PI + w.phase);
    p.multiplyScalar(radius);
    for (const { normal, offset } of planes) {
      const over = p.dot(normal) - offset;
      if (over > 0) p.addScaledVector(normal, -over);
    }
    positions.setXYZ(i, p.x, p.y, p.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}
