import type { GameWorld, System } from '@core';
import { GrassWatchdog } from './GrassWatchdog';
import type {} from './GrassFieldComponent';

/** Drops grass density a step when frames stay slow (frame system; see `GrassWatchdog`). */
export class GrassWatchdogSystem implements System {
  private readonly fields;
  private readonly dog: GrassWatchdog;

  constructor(world: GameWorld, targetFps = 50) {
    this.fields = world.with('grassField');
    this.dog = new GrassWatchdog(targetFps);
  }

  update(dt: number): void {
    for (const { grassField } of this.fields) grassField.keep.value = this.dog.update(dt, grassField.keep.value);
  }
}
