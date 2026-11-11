import type { GameWorld, Random, System } from '@core';
import type { RenderContext } from '@rendering';
import {
  RippleSimulation,
  RippleSystem,
  SplashTriggerSystem,
  WadingRippleSystem,
  WaterEventBus,
  WetnessSystem,
  type RippleStamper,
  type RippleUniforms,
} from '@water';
import { DripSystem, DropletPool, SplashSystem, WetLookSystem } from '@effects';

/** Lane C2 wiring: what the weather lane and audio reach for, plus the systems to run. */
export interface WaterReactions {
  /** Stamp ripples (rain drops, anything touching the water). */
  ripples: RippleStamper;
  /** Footstep, splash and swim stroke events. */
  events: WaterEventBus;
  /** Run after the physics pose (fixed step). */
  fixedSystems: System[];
  /** Run before the camera and render (frame). */
  frameSystems: System[];
}

/** Ripple simulation (256 texels over 40 m, 128 on phones), splashes, wakes, footsteps, drips and the wet look. */
export function installWaterReactions(
  world: GameWorld,
  render: RenderContext,
  ripple: RippleUniforms,
  random: Random,
  mobile: boolean,
): WaterReactions {
  const ripples = new RippleSimulation(render.renderer, ripple, mobile ? 128 : 256, 40);
  const events = new WaterEventBus();
  const droplets = new DropletPool(mobile ? 160 : 400, ripples);
  render.scene.add(droplets.mesh);
  return {
    ripples,
    events,
    fixedSystems: [
      new SplashTriggerSystem(world, ripples, events),
      new WadingRippleSystem(world, ripples, events),
      new WetnessSystem(world),
    ],
    frameSystems: [
      new SplashSystem(events, droplets, random.fork('splash')),
      new DripSystem(world, droplets, random.fork('drips')),
      new WetLookSystem(world),
      new RippleSystem(world, ripples),
    ],
  };
}
