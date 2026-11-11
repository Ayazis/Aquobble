/** What a stamp darkens: `contact` is the soft patch where an object meets the ground, `canopy` the shade of tree crowns. */
export type GroundShadeChannel = 'contact' | 'canopy';

const CHANNELS: Record<GroundShadeChannel, number> = { contact: 0, canopy: 1 };

/**
 * A square map of how shaded the ground is, centred on the origin: two bytes per texel (contact, canopy).
 * Whoever places a static object stamps a soft disc under it; the ground and whatever must match it read
 * the map back. Pure data, filled once while the world is built.
 */
export class GroundShade {
  readonly data: Uint8Array;

  constructor(
    /** World size in metres (square), normally the terrain's. */
    readonly size: number,
    /** Texels per side. */
    readonly resolution: number,
  ) {
    this.data = new Uint8Array(resolution * resolution * 2);
  }

  /** Darkens a disc: full `strength` (0..1) in the inner third, easing to nothing at `radius`. Overlaps add up softly. */
  stamp(x: number, z: number, radius: number, strength: number, channel: GroundShadeChannel = 'contact'): void {
    const scale = this.resolution / this.size;
    const cx = (x + this.size / 2) * scale - 0.5;
    const cz = (z + this.size / 2) * scale - 0.5;
    const r = radius * scale;
    const last = this.resolution - 1;
    for (let row = Math.max(Math.floor(cz - r), 0); row <= Math.min(Math.ceil(cz + r), last); row++) {
      for (let column = Math.max(Math.floor(cx - r), 0); column <= Math.min(Math.ceil(cx + r), last); column++) {
        const t = Math.min(Math.max((1 - Math.hypot(column - cx, row - cz) / r) / (2 / 3), 0), 1);
        if (t <= 0) continue;
        const i = (row * this.resolution + column) * 2 + CHANNELS[channel];
        const before = this.data[i] / 255;
        const added = strength * t * t * (3 - 2 * t);
        this.data[i] = Math.round((1 - (1 - before) * (1 - added)) * 255);
      }
    }
  }

  /** Shade (0..1) of the texel under a world position; 0 outside the map. */
  at(x: number, z: number, channel: GroundShadeChannel = 'contact'): number {
    const scale = this.resolution / this.size;
    const column = Math.floor((x + this.size / 2) * scale);
    const row = Math.floor((z + this.size / 2) * scale);
    if (column < 0 || row < 0 || column >= this.resolution || row >= this.resolution) return 0;
    return this.data[(row * this.resolution + column) * 2 + CHANNELS[channel]] / 255;
  }
}
