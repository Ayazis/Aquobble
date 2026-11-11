import type { Random } from '@core';
import type { Occupancy } from './Occupancy';
import type { RoadNetwork } from './RoadNetwork';
import { sizedPlot } from './sizedPlot';
import { streetLength, vergePoint } from './streetPath';
import { TOWN_ASSET_SIZES, type TownAssetId } from './townAssetSizes';
import type { TownPlot } from './TownPlot';
import type { TownStreet } from './TownStreet';

/** Gap (m) between the paving edge and a lantern's footprint, and the spacing range of lanterns along a road. */
const LAMP_OFF = 0.4;
const SPACING = [12, 16] as const;
/** Lanterns stand this far in from the street's gate end, and this far in from the square's corners. */
const GATE_IN = 1.5;
const CORNER_IN = 0.3;
const SIDES = [1, -1] as const;

/** Puts lanterns, benches and signposts on the verges, relative to the road network, never in front of a door. */
export class StreetFurniturePlacer {
  constructor(
    private readonly network: RoadNetwork,
    private readonly space: Occupancy,
    private readonly random: Random,
  ) {}

  /** Lanterns that anchor the layout: one in each corner of the square and both sides of every gate. */
  anchorLamps(): TownPlot[] {
    const lamps: TownPlot[] = [];
    for (const c of this.network.square) {
      const len = Math.hypot(c.x, c.z);
      const t = (len - CORNER_IN * Math.SQRT2) / len;
      this.add(lamps, sizedPlot('lantern_post', c.x * t, c.z * t, Math.atan2(-c.x, -c.z)));
    }
    for (const s of this.network.streets.filter((s) => s.gate)) {
      for (const side of SIDES) this.onVerge(lamps, s, 'lantern_post', streetLength(s) - GATE_IN, side, LAMP_OFF);
    }
    return lamps;
  }

  /** Lanterns between the anchors, 12 to 16 m apart, alternating sides on main streets. */
  fillLamps(): TownPlot[] {
    const lamps: TownPlot[] = [];
    for (const s of this.network.streets) {
      const end = streetLength(s) - GATE_IN;
      let side: 1 | -1 = 1;
      for (let last = 0; end - last > SPACING[1];) {
        const next = this.firstFit(s, last + SPACING[0], last + SPACING[1], side) ?? last + SPACING[1];
        if (!this.onVerge(lamps, s, 'lantern_post', next, side, LAMP_OFF)) {
          this.onVerge(lamps, s, 'lantern_post', next, -side as 1 | -1, LAMP_OFF);
        }
        last = next;
        if (s.kind === 'main') side = -side as 1 | -1;
      }
    }
    return lamps;
  }

  /** A bench on a free verge of every street, facing the road, and one on the square's north edge facing the well. */
  benches(): TownPlot[] {
    const benches: TownPlot[] = [];
    this.add(benches, sizedPlot('bench', 2.8, 4.9, Math.PI));
    for (const s of this.network.streets) {
      const length = streetLength(s);
      for (let tries = 0; tries < 24; tries++) {
        const side = this.random.next() < 0.5 ? 1 : -1;
        if (this.onVerge(benches, s, 'bench', this.random.range(2, length - 2), side, 0.15)) break;
      }
    }
    return benches;
  }

  /** Signposts inside every gate and where the main streets leave the square, pointing along the road. */
  signposts(): TownPlot[] {
    const signs: TownPlot[] = [];
    for (const s of this.network.streets) {
      const length = streetLength(s);
      const spots = s.gate ? [length - 3.2] : [];
      if (s.kind === 'main') spots.push(1.2);
      for (const d of spots) {
        if (!this.onVerge(signs, s, 'sign_post', d, 1, 0.3)) this.onVerge(signs, s, 'sign_post', d, -1, 0.3);
      }
    }
    return signs;
  }

  /** First distance in [from, to] (0.5 m steps) where a lantern fits on `side`. */
  private firstFit(s: TownStreet, from: number, to: number, side: 1 | -1): number | undefined {
    for (let d = from; d <= to; d += 0.5) {
      for (const sd of [side, -side as 1 | -1])
        if (this.space.fits(this.verge(s, 'lantern_post', d, sd, LAMP_OFF))) return d;
    }
    return undefined;
  }

  private verge(s: TownStreet, id: TownAssetId, d: number, side: 1 | -1, off: number): TownPlot {
    const at = vergePoint(s, d, side, off + TOWN_ASSET_SIZES[id].depth / 2);
    return sizedPlot(id, at.x, at.z, at.facing);
  }

  private onVerge(out: TownPlot[], s: TownStreet, id: TownAssetId, d: number, side: 1 | -1, off: number): boolean {
    return this.add(out, this.verge(s, id, d, side, off));
  }

  private add(out: TownPlot[], plot: TownPlot): boolean {
    if (!this.space.take(plot)) return false;
    out.push(plot);
    return true;
  }
}
