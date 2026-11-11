import type { Vec3 } from '@core';

/**
 * Cloud-shadow values shared by every lit material. The arrays are handed to three.js by reference (see
 * `installToonLighting`), so writing them here updates every shader at once with no per-material work.
 */
export class CloudShadow {
  /** x = cloud clock in seconds, y = darkening under a full cloud (0 turns it off). */
  readonly params = new Float32Array(4);
  /** xyz = unit direction towards the sun, in world space. */
  readonly sun = new Float32Array([0, 1, 0, 0]);
  /** `RenderQuality.cloudShadows`: off keeps the strength at 0, which skips the work in the shader. */
  enabled = true;

  set(time: number, sun: Vec3, strength: number): void {
    this.params[0] = time;
    this.params[1] = this.enabled ? strength : 0;
    this.sun[0] = sun.x;
    this.sun[1] = sun.y;
    this.sun[2] = sun.z;
  }
}
