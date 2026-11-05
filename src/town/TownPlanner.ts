import { vec3, type Vec3 } from '@core';
import type { FlattenRegion, HeightSampler } from '@terrain';
import type { TownLayout } from './layout/TownLayout';
import type { TownPlot } from './layout/TownPlot';
import type { PlacedTown } from './PlacedTown';

export interface TownSite {
  /** World x/z of the town square's centre. */
  x: number;
  z: number;
  /** Width of the band where the levelled ground eases back into the hills. */
  blend: number;
  /** Lowest allowed ground level for the town (keeps it clear of the water). */
  minLevel: number;
}

/** Places a town layout on the terrain: picks a ground level and resolves world positions. */
export class TownPlanner {
  constructor(private readonly layout: TownLayout) {}

  /** The square to flatten: the whole town plus a small margin, with the site's blend band. */
  region(site: TownSite): FlattenRegion {
    return { centerX: site.x, centerZ: site.z, halfSize: this.layout.size / 2 + 2, blend: site.blend };
  }

  /** Mean of the natural ground over the town (3 x 3 samples), never below `minLevel`. */
  level(ground: HeightSampler, site: TownSite): number {
    const half = this.layout.size / 2;
    let sum = 0;
    for (const dx of [-half, 0, half])
      for (const dz of [-half, 0, half]) sum += ground.heightAt(site.x + dx, site.z + dz);
    return Math.max(sum / 9, site.minLevel);
  }

  /** Resolves every plot to a world position on the (already flattened) ground. */
  place(ground: HeightSampler, site: TownSite): PlacedTown {
    const toWorld = (plot: TownPlot): Vec3 => {
      const x = site.x + plot.x;
      const z = site.z + plot.z;
      return vec3(x, ground.heightAt(x, z), z);
    };
    return {
      layout: this.layout,
      origin: vec3(site.x, ground.heightAt(site.x, site.z), site.z),
      buildings: this.layout.buildings.map((plot) => ({ plot, position: toWorld(plot) })),
      props: this.layout.props.map((plot) => ({ plot, position: toWorld(plot) })),
    };
  }
}
