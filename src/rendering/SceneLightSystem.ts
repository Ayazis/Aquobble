import * as THREE from 'three';
import type { System, Vec3 } from '@core';
import type { SceneLightUniforms } from './SceneLightUniforms';

/**
 * Share of the sun/moon light that still reaches shadowed ground. By day almost none: shade is lit by the sky
 * and the ground's bounce. Moon shadows keep a blue lift, or the night would have holes in it.
 */
const DAY_TINT = [0.015, 0.02, 0.03] as const;
const NIGHT_TINT = [0.1, 0.13, 0.26] as const;
/** How much of the sky fill's ground colour takes the hue of the ground under the player. */
const BOUNCE = 0.65;
/** Per second: how fast the bounce colour follows the ground when walking from meadow onto a road. */
const FOLLOW = 2;

/**
 * Frame system for the shared light values: sets how much key light leaks into shadow (day or night), and turns
 * the hemisphere fill's ground colour into a bounce light from the ground under the player (green on the
 * meadow, warm on sand and roads), so roof undersides and tree crowns pick up its colour. Run after the
 * day/night system has set the fill for this hour.
 */
export class SceneLightSystem implements System {
  private readonly bounce = new THREE.Color(1, 1, 1);
  private readonly target = new THREE.Color();
  private readonly tinted = new THREE.Color();

  constructor(
    private readonly light: SceneLightUniforms,
    private readonly fill: THREE.HemisphereLight,
    private readonly night: () => number,
    private readonly focus: () => Vec3 | undefined,
    /** sRGB hex colour of the ground at a world point. */
    private readonly groundAt: (point: Vec3) => number,
  ) {}

  update(dt: number): void {
    const n = Math.min(1, Math.max(0, this.night()));
    const tint = DAY_TINT.map((day, i) => day + (NIGHT_TINT[i] - day) * n);
    this.light.setShadowTint(tint[0], tint[1], tint[2]);

    const point = this.focus();
    if (point) this.bounce.lerp(this.target.setHex(this.groundAt(point)), Math.min(1, dt * FOLLOW));
    const base = this.fill.groundColor;
    const scale = luminance(base) / Math.max(1e-4, luminance(this.bounce));
    base.lerp(this.tinted.copy(this.bounce).multiplyScalar(scale), BOUNCE);
  }
}

function luminance(c: THREE.Color): number {
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}
