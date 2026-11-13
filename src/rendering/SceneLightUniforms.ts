import type { Vec3 } from '@core';

/** Most local light probes the shader reads; unused slots have radius 0. */
export const MAX_LIGHT_PROBES = 8;

/** A baked probe: where it is, how far it reaches, and its L1 spherical-harmonic openness (c0, c1.xyz). */
export interface LightProbe {
  position: Vec3;
  radius: number;
  sh: readonly [number, number, number, number];
}

/**
 * Light values shared by every lit material (handed to three.js by reference, see `installSceneLighting`):
 * the colour shadows are tinted towards, and the local probes that darken and warm the sky fill in streets.
 */
export class SceneLightUniforms {
  /** Linear RGB share of the key light that still reaches shadowed ground (near zero by day). */
  readonly shadowTint = new Float32Array([0.015, 0.02, 0.03]);
  /** Per probe: xyz world position, w radius in metres (0 = unused). */
  readonly probePositions = new Float32Array(MAX_LIGHT_PROBES * 4);
  /** Per probe: L1 SH openness, x = constant term, yzw = linear (world direction) term. */
  readonly probeSh = new Float32Array(MAX_LIGHT_PROBES * 4);

  setShadowTint(r: number, g: number, b: number): void {
    this.shadowTint.set([r, g, b]);
  }

  setProbes(probes: readonly LightProbe[]): void {
    this.probePositions.fill(0);
    this.probeSh.fill(0);
    probes.slice(0, MAX_LIGHT_PROBES).forEach((probe, i) => {
      const { x, y, z } = probe.position;
      this.probePositions.set([x, y, z, probe.radius], i * 4);
      this.probeSh.set(probe.sh, i * 4);
    });
  }
}
