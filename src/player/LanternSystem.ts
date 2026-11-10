import type { GameWorld, System } from '@core';
import type { KeyboardState } from './KeyboardState';
import type {} from './Lantern';
import type { LanternButton } from './LanternButton';

/** Seconds for the flame to come up or die down. */
const FADE_SECONDS = 0.25;

/** Frame system: L (or the lantern button) switches the player's lantern, and its light eases on and off. */
export class LanternSystem implements System {
  private readonly lanterns;

  constructor(
    world: GameWorld,
    private readonly keys: KeyboardState,
    private readonly button?: LanternButton,
  ) {
    this.lanterns = world.with('lantern');
  }

  update(dt: number): void {
    const keyPressed = this.keys.consumePress('KeyL');
    const toggle = (this.button?.consumePress() ?? false) || keyPressed;
    for (const { lantern } of this.lanterns) {
      if (toggle) {
        lantern.on = !lantern.on;
        this.button?.show(lantern.on);
      }
      const target = lantern.on ? lantern.intensity : 0;
      const step = (lantern.intensity / FADE_SECONDS) * dt;
      const { light } = lantern;
      light.intensity += Math.min(step, Math.max(-step, target - light.intensity));
      lantern.lamp.visible = light.intensity > 0;
    }
  }
}
