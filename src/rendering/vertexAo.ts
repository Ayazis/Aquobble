/** Darkness at a vertex whose every ray is blocked (1 - this is the floor of the AO value). */
const STRENGTH = 0.55;
const EPSILON = 1e-4;

/**
 * Ambient occlusion per vertex against its own mesh: `rays` fixed directions over the hemisphere around
 * the normal, each tested against every triangle within `reach`. Returns 1 (open) down to 1 - STRENGTH.
 * Brute force (vertices x rays x triangles), so callers keep it to small meshes, once at load.
 */
export function vertexAo(
  positions: ArrayLike<number>,
  normals: ArrayLike<number>,
  indices: ArrayLike<number>,
  rays: number,
  reach: number,
): Float32Array {
  const count = positions.length / 3;
  const out = new Float32Array(count).fill(1);
  const directions = hemisphere(rays);
  const d = [0, 0, 0];
  for (let v = 0; v < count; v++) {
    const n = [normals[v * 3], normals[v * 3 + 1], normals[v * 3 + 2]];
    const [t, b] = basis(n);
    const o = [0, 1, 2].map((k) => positions[v * 3 + k] + n[k] * reach * 0.01);
    let hits = 0;
    for (const [x, y, z] of directions) {
      for (let k = 0; k < 3; k++) d[k] = t[k] * x + b[k] * y + n[k] * z;
      if (hitsAny(positions, indices, o, d, reach)) hits++;
    }
    out[v] = 1 - (STRENGTH * hits) / directions.length;
  }
  return out;
}

/** Fixed, roughly cosine-weighted directions in tangent space (z up). */
function hemisphere(rays: number): number[][] {
  return Array.from({ length: rays }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / rays);
    const phi = i * 2.399963;
    return [r * Math.cos(phi), r * Math.sin(phi), Math.sqrt(1 - r * r)];
  });
}

function basis(n: number[]): [number[], number[]] {
  const a = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const t = cross(a, n);
  const len = Math.hypot(t[0], t[1], t[2]) || 1;
  const tn = t.map((c) => c / len);
  return [tn, cross(n, tn)];
}

function cross(a: number[], b: number[]): number[] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** Möller-Trumbore against every triangle; true at the first hit closer than `reach`. */
function hitsAny(p: ArrayLike<number>, idx: ArrayLike<number>, o: number[], d: number[], reach: number): boolean {
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3;
    const b = idx[i + 1] * 3;
    const c = idx[i + 2] * 3;
    const e1x = p[b] - p[a],
      e1y = p[b + 1] - p[a + 1],
      e1z = p[b + 2] - p[a + 2];
    const e2x = p[c] - p[a],
      e2y = p[c + 1] - p[a + 1],
      e2z = p[c + 2] - p[a + 2];
    const px = d[1] * e2z - d[2] * e2y,
      py = d[2] * e2x - d[0] * e2z,
      pz = d[0] * e2y - d[1] * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < EPSILON * EPSILON) continue;
    const inv = 1 / det;
    const sx = o[0] - p[a],
      sy = o[1] - p[a + 1],
      sz = o[2] - p[a + 2];
    const u = (sx * px + sy * py + sz * pz) * inv;
    if (u < 0 || u > 1) continue;
    const qx = sy * e1z - sz * e1y,
      qy = sz * e1x - sx * e1z,
      qz = sx * e1y - sy * e1x;
    const w = (d[0] * qx + d[1] * qy + d[2] * qz) * inv;
    if (w < 0 || u + w > 1) continue;
    const dist = (e2x * qx + e2y * qy + e2z * qz) * inv;
    if (dist > EPSILON && dist < reach) return true;
  }
  return false;
}
