/**
 * Component written by `WaterContactSystem` each fixed step for every character, buoyant body and loose rock.
 * Effects (ripples, wakes, splashes, wet look) and movement read it; nobody else writes it.
 */
export interface WaterContact {
  /** Distance (m) from the transform position down to the entity's lowest point (feet, keel). Set at spawn. */
  bottom: number;
  /** The entity's lowest point is below the water surface this step. */
  inWater: boolean;
  /** Water surface height (m, world y) over the entity, waves included. */
  surfaceY: number;
  /** How deep the water is here: surface minus ground (m). Not positive on dry land. */
  depth: number;
  /** How far the surface is above the entity's lowest point (m); negative while clear of the water. */
  immersion: number;
  /** Horizontal and vertical speed (m/s) over the last step. */
  speed: number;
  verticalSpeed: number;
  /** Became wet / dry this step (one-step pulses for splashes and drips). */
  entered: boolean;
  left: boolean;
  /** Position last step, for the speed; also where the entity was when `left` fires. */
  lastX: number;
  lastY: number;
  lastZ: number;
}

/** A dry contact for an entity whose lowest point is `bottom` below its position; place `at` its position. */
export function dryContact(bottom: number, at: { x: number; y: number; z: number }): WaterContact {
  const { x, y, z } = at;
  const base = { inWater: false, surfaceY: -Infinity, depth: 0, immersion: -Infinity, speed: 0, verticalSpeed: 0 };
  return { bottom, ...base, entered: false, left: false, lastX: x, lastY: y, lastZ: z };
}

declare module '@core/ecs/Entity' {
  interface Entity {
    waterContact?: WaterContact;
  }
}
