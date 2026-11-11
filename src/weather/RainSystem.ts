import type * as THREE from 'three';
import type { GameWorld, System } from '@core';
import type {} from '@physics';
import type {} from '@water';
import type { RainField } from './RainField';
import type { RainSurface } from './RainSurface';
import type { Weather } from './Weather';

/** Rain heavier than this soaks the characters. */
const SOAKING_RAIN = 0.35;
/** Only every n-th landing on the ground splashes, and on water ripples, to keep the cost flat. */
const SPLASH_EVERY = 6;
const RIPPLE_EVERY = 3;

/**
 * Frame system: rain streaks round the camera, ripples where they hit water, small splashes on the ground,
 * and characters out in it get wet all over (`wetness` amount 1, line at their height).
 */
export class RainSystem implements System {
  private readonly characters;
  private landings = 0;

  constructor(
    private readonly world: GameWorld,
    private readonly weather: Weather,
    private readonly rain: RainField,
    private readonly camera: THREE.Camera,
    private readonly surface: RainSurface,
    private readonly wind: () => { x: number; z: number },
    private readonly characterHeight: number,
  ) {
    this.characters = world.with('transform', 'characterBody');
  }

  update(dt: number): void {
    const rain = this.weather.mix.rain;
    const w = this.wind();
    const s = this.surface;
    this.rain.update(dt, this.camera.position, rain, w.x * 3, w.z * 3, s.landingHeight.bind(s), (x, z, y) =>
      this.land(x, z, y),
    );
    if (rain < SOAKING_RAIN) return;
    for (const entity of this.characters) {
      if (!entity.wetness) {
        const feetY = entity.transform.position.y - this.characterHeight / 2;
        this.world.addComponent(entity, 'wetness', { line: 0, amount: 0, sinceLeft: 0, feetY });
      }
      const wet = entity.wetness;
      if (!wet) continue;
      wet.amount = 1;
      wet.line = Math.max(wet.line, this.characterHeight);
    }
  }

  private land(x: number, z: number, y: number): void {
    this.landings++;
    if (this.surface.isWater(x, z)) {
      if (this.landings % RIPPLE_EVERY === 0) this.surface.ripple(x, z, 0.12, 0.08);
    } else if (this.landings % SPLASH_EVERY === 0) {
      this.surface.splash(x, y, z);
    }
  }
}
