import type { Vec3 } from '@core';

/**
 * Component: a dynamic body that floats (or sinks slowly). `BuoyancySystem` samples each point against the
 * water surface, pushes it up by the water it displaces there and drags it through the water.
 */
export interface Buoyant {
  /** Sample points in body space; four spread over the hull is plenty. */
  points: Vec3[];
  /** Volume (m³) displaced when fully under, in the engine's density units (water is 1). */
  volume: number;
  /** Half the body's height at each point (m): a point is fully under once the surface is this far above it. */
  halfHeight: number;
  /** Linear water drag per second, per unit of displaced water. */
  drag: number;
  /** World positions of the points last step (x, y, z per point), for their velocities. Filled by the system. */
  previous?: number[];
}

declare module '@core/ecs/Entity' {
  interface Entity {
    buoyant?: Buoyant;
  }
}
