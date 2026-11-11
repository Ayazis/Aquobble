import type * as THREE from 'three';
import type { GameWorld, System, Vec3 } from '@core';
import type { DayClock } from './DayClock';
import type { LightPools } from './LightPools';
import type { LightSlot } from './LightSlot';
import { nearestLamps } from './nearestLamps';
import { nightFactor } from './nightFactor';
import { setLampShadowActive } from './castLampShadow'; // lane D2
import type {} from './StreetLamp';
import type { StreetLightOptions } from './StreetLightOptions';

/**
 * Frame system: switches the town's lamps on at dusk and off at dawn. Sets the shared glow of lamp glass and
 * windows and the brightness of the painted pools, and moves the few real lights (none on phones) to the
 * lamps nearest `focus`. The number of lights never changes, so no shader recompiles.
 */
export class StreetLightSystem implements System {
  private readonly lamps: Vec3[];
  private readonly slots: LightSlot[];
  private dark = true;

  /** Lamps are read once: street lamps never move and none are added after the town is built. */
  constructor(
    world: GameWorld,
    private readonly clock: DayClock,
    private readonly glow: { value: number },
    private readonly pools: LightPools,
    private readonly lights: readonly THREE.PointLight[],
    /** Where the player is; undefined (no player yet) leaves the lights where they are. */
    private readonly focus: () => Vec3 | undefined,
    private readonly options: StreetLightOptions,
  ) {
    this.lamps = [...world.with('streetLamp')].map((entity) => entity.streetLamp.glass);
    this.slots = lights.map(() => ({ lamp: -1, weight: 0 }));
  }

  update(): void {
    const { onBelowSunHeight, fullBelowSunHeight, poolStrength } = this.options;
    const night = nightFactor(this.clock.timeOfDay, onBelowSunHeight, fullBelowSunHeight);
    this.glow.value = night;
    this.pools.strength.value = night * poolStrength;
    this.pools.object.visible = night > 0;
    if (this.lights.length === 0) return;
    if (night === 0) return this.switchOff();
    if (this.dark) for (const light of this.lights) setLampShadowActive(light, true); // lane D2
    this.dark = false;
    const focus = this.focus();
    if (focus) nearestLamps(this.lamps, focus, this.options.lightBlend, this.slots);
    for (let i = 0; i < this.slots.length; i++) {
      const { lamp, weight } = this.slots[i];
      const light = this.lights[i];
      light.intensity = lamp < 0 ? 0 : this.options.lightIntensity * night * weight;
      if (lamp >= 0) light.position.copy(this.lamps[lamp]);
    }
  }

  /** By day the lights stay in the scene at zero strength; written once, not every frame. */
  private switchOff(): void {
    if (this.dark) return;
    this.dark = true;
    for (const light of this.lights) {
      light.intensity = 0;
      setLampShadowActive(light, false); // lane D2: no shadow redraws by day
    }
  }
}
