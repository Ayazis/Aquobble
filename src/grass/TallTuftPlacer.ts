import type { Random } from '@core';
import type { HeightSampler } from '@terrain';
import { canGrow } from './canGrow';
import type { GrassBlocker } from './GrassBlocker';
import type { GrassPlacement } from './GrassPlacement';
import type { GroundRules } from './GroundRules';
import { growthAt } from './growthAt';
import { patchiness } from './patchiness';

/** Tall tufts in clumps: `clumps` centres, each with `perClump` tufts within `radius` metres. */
export interface TallTuftOptions {
  clumps: number;
  perClump: number;
  radius: number;
  extent: number;
}

/** Seed-head grass grows only where the meadow is at least this thick (see `patchiness`). */
const MEADOW_THICKNESS = 0.55;
/** Seed heads stay below this height; above it the grass dries out instead. */
const MEADOW_TOP = 9;
/** Shore reeds grow between these heights above the sea, over the upper beach (bare of other grass). */
const SHORE_BAND = [0.15, 1.1] as const;
/** Pond reeds stand in a band from this share of the pond radius out to just past its edge. */
const POND_BAND = [0.8, 1.1] as const;

/** Scatters the tall tuft kinds: seed-head grass in thick meadow, reeds at ponds and along the shore. */
export class TallTuftPlacer {
  constructor(
    private readonly ground: HeightSampler,
    private readonly random: Random,
    private readonly rules: GroundRules,
  ) {}

  /** Clumps of seed-head grass in thick, low meadow, away from lawns and blockers. */
  seedHeads(options: TallTuftOptions): GrassPlacement[] {
    const meadow = (x: number, z: number, y: number) =>
      y < MEADOW_TOP && patchiness(x, z) > MEADOW_THICKNESS && this.clear(x, z) && !this.onLawn(x, z);
    return this.clumps(options, this.rules, meadow, 0.85, 1.25);
  }

  /** Clumps of reeds in a ring around each pond, and on the low ground just above the sea. */
  reeds(
    pondOptions: TallTuftOptions,
    shore: TallTuftOptions,
    ponds: readonly GrassBlocker[],
    sea: number,
  ): GrassPlacement[] {
    const out: GrassPlacement[] = [];
    const pondRules = { ...this.rules, minHeight: -Infinity, maxSlope: this.rules.maxSlope * 1.5 };
    for (const pond of ponds) {
      if (pond.kind !== 'circle') continue;
      for (let c = 0; c < pondOptions.clumps; c++) {
        const angle = this.random.range(0, Math.PI * 2);
        const r = pond.radius * this.random.range(POND_BAND[0], POND_BAND[1]);
        const centre = { x: pond.x + Math.cos(angle) * r, z: pond.z + Math.sin(angle) * r };
        this.clump(out, centre, pondOptions, pondRules, () => true, 0.8, 1.2);
      }
    }
    const shoreRules = { ...this.rules, minHeight: -Infinity };
    const onShore = (x: number, z: number, y: number) =>
      y > sea + SHORE_BAND[0] && y < sea + SHORE_BAND[1] && this.clear(x, z);
    out.push(...this.clumps(shore, shoreRules, onShore, 0.7, 1.1));
    return out;
  }

  private clumps(
    options: TallTuftOptions,
    rules: GroundRules,
    fits: (x: number, z: number, y: number) => boolean,
    min: number,
    max: number,
  ): GrassPlacement[] {
    const out: GrassPlacement[] = [];
    // Look for clump centres on suitable ground; give up after a fixed number of tries.
    for (let found = 0, tries = 0; found < options.clumps && tries < options.clumps * 30; tries++) {
      const centre = {
        x: this.random.range(-options.extent, options.extent),
        z: this.random.range(-options.extent, options.extent),
      };
      const y = canGrow(this.ground, rules, centre.x, centre.z);
      if (y === null || !fits(centre.x, centre.z, y)) continue;
      found++;
      this.clump(out, centre, options, rules, fits, min, max);
    }
    return out;
  }

  private clump(
    out: GrassPlacement[],
    centre: { x: number; z: number },
    { perClump, radius }: TallTuftOptions,
    rules: GroundRules,
    fits: (x: number, z: number, y: number) => boolean,
    min: number,
    max: number,
  ): void {
    for (let i = 0; i < perClump; i++) {
      const angle = this.random.range(0, Math.PI * 2);
      const r = radius * Math.sqrt(this.random.next());
      const x = centre.x + Math.cos(angle) * r;
      const z = centre.z + Math.sin(angle) * r;
      const yaw = this.random.range(0, Math.PI * 2);
      // Taller towards the clump's middle.
      const scale = this.random.range(min, max) * (1 - 0.3 * (r / radius));
      const tint = this.random.next();
      const y = canGrow(this.ground, rules, x, z);
      if (y === null || !fits(x, z, y)) continue;
      out.push({ x, y: y - 0.05, z, yaw, scale, tint, variant: 0 });
    }
  }

  private clear(x: number, z: number): boolean {
    return growthAt(this.rules.blockers ?? [], this.rules.feather ?? 1.5, x, z) >= 1;
  }

  private onLawn(x: number, z: number): boolean {
    return (this.rules.lawns ?? []).some((e) => x > e.minX && x < e.maxX && z > e.minZ && z < e.maxZ);
  }
}
