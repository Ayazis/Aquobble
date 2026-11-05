import type { Random } from '@core';
import type { HeightField } from './HeightField';
import type { Pond } from './Pond';
import type { PondAvoidArea, PondOptions } from './PondOptions';

const ATTEMPTS_PER_POND = 40;
const RIM_SAMPLES = 24;

/**
 * Digs seeded circular hollows into a height field (run before the terrain mesh and collider are
 * built). The water level of each pond sits just below the lowest point of its rim, so it never spills.
 */
export class PondCarver {
  constructor(private readonly random: Random) {}

  carve(field: HeightField, options: PondOptions): Pond[] {
    const ponds: Pond[] = [];
    for (let attempt = 0; attempt < options.count * ATTEMPTS_PER_POND && ponds.length < options.count; attempt++) {
      const pond = this.candidate(field, options);
      if (!pond || this.blocked(pond, ponds, options.avoid ?? [])) continue;
      this.dig(field, pond, options.depth);
      ponds.push(pond);
    }
    return ponds;
  }

  private candidate(field: HeightField, options: PondOptions): Pond | undefined {
    const x = this.random.range(-options.extent, options.extent);
    const z = this.random.range(-options.extent, options.extent);
    const radius = this.random.range(options.minRadius, options.maxRadius);
    let rim = Infinity;
    for (let i = 0; i < RIM_SAMPLES; i++) {
      const angle = (i / RIM_SAMPLES) * Math.PI * 2;
      rim = Math.min(rim, field.heightAt(x + Math.cos(angle) * radius, z + Math.sin(angle) * radius));
    }
    const level = rim - options.freeboard;
    return level >= options.minLevel ? { x, z, radius, level } : undefined;
  }

  private blocked(pond: Pond, others: readonly Pond[], avoid: readonly PondAvoidArea[]): boolean {
    const margin = pond.radius + 2;
    const inArea = avoid.some(
      (a) =>
        pond.x > a.minX - margin && pond.x < a.maxX + margin && pond.z > a.minZ - margin && pond.z < a.maxZ + margin,
    );
    return inArea || others.some((o) => Math.hypot(o.x - pond.x, o.z - pond.z) < o.radius + margin);
  }

  /** Lowers samples inside the circle to a parabolic bowl; never raises terrain. */
  private dig(field: HeightField, pond: Pond, depth: number): void {
    for (let row = 0; row < field.samples; row++) {
      for (let column = 0; column < field.samples; column++) {
        const t = Math.hypot(field.coordinate(column) - pond.x, field.coordinate(row) - pond.z) / pond.radius;
        if (t >= 1) continue;
        const target = pond.level - depth * (1 - t * t);
        const i = row * field.samples + column;
        field.heights[i] = Math.min(field.heights[i], target);
      }
    }
  }
}
