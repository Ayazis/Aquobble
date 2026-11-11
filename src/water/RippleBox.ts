/** A ripple drop in the box's uv space. */
export interface RippleDrop {
  u: number;
  v: number;
  /** Radius in uv. */
  radius: number;
  strength: number;
  foam: number;
}

/**
 * The square of water simulated round the player, snapped to whole texels so recentring only shifts the
 * map by whole texels (no blur). Pure maths, no three.js.
 */
export class RippleBox {
  minX = 0;
  minZ = 0;
  readonly texel: number;

  constructor(
    readonly size: number,
    readonly resolution: number,
  ) {
    this.texel = size / resolution;
  }

  /** Recentres on (x, z); returns the shift in whole texels the old map must move by. */
  follow(x: number, z: number): { dx: number; dz: number } {
    const minX = Math.round((x - this.size / 2) / this.texel) * this.texel;
    const minZ = Math.round((z - this.size / 2) / this.texel) * this.texel;
    const dx = Math.round((minX - this.minX) / this.texel);
    const dz = Math.round((minZ - this.minZ) / this.texel);
    this.minX = minX;
    this.minZ = minZ;
    return { dx, dz };
  }

  /** A world stamp as a uv drop, or null when it misses the box. */
  toDrop(x: number, z: number, radius: number, strength: number, foam: number): RippleDrop | null {
    const u = (x - this.minX) / this.size;
    const v = (z - this.minZ) / this.size;
    const r = Math.max(radius, this.texel * 1.5) / this.size;
    if (u < -r || v < -r || u > 1 + r || v > 1 + r) return null;
    return { u, v, radius: r, strength, foam };
  }
}
