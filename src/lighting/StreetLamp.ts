import type { Vec3 } from '@core';

/**
 * Component: a street lamp that lights up at night. World-space points, fixed once the town stands.
 *
 * Agreed shape (lane W0-b contract): other lanes (village layout, lamp light pools, moths, wet
 * reflections) read lamps only through `world.with('streetLamp')` and these two points. A lamp's
 * on/off state stays derived from the day cycle in `lighting`, not stored here; new per-lamp data
 * (e.g. colour, flicker seed) is added as optional fields so existing spawners keep compiling.
 */
export interface StreetLamp {
  /** Centre of the lamp glass: where a real light sits when this lamp is among the nearest. */
  glass: Vec3;
  /** The point on the ground straight below the glass: centre of its pool of light. */
  ground: Vec3;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    streetLamp?: StreetLamp;
  }
}
