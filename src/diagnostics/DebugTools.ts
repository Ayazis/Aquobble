import type { System, Vec3 } from '@core';
import type { DebugCamera } from './DebugCamera';
import type { DebugClock } from './DebugClock';
import type { RenderStatsSource } from './RenderStatsSource';

/** Keys held or pressed, by `KeyboardEvent.code` (the game's keyboard state). */
export interface DebugKeys {
  isHeld(code: string): boolean;
  consumePress(code: string): boolean;
}

/** What `window.__aquobble` offers in debug mode; the screenshot script drives the game through it. */
export interface DebugApi {
  /** Frames drawn since start. */
  readonly frame: number;
  setTimeOfDay(time: number): void;
  pauseTime(paused: boolean): void;
  setCamera(position: Vec3, target: Vec3): void;
  releaseCamera(): void;
  /** Height of the highest collider at (x, z), or null over open sea. */
  groundHeight(x: number, z: number): number | null;
  stats(): { calls: number; triangles: number };
}

/** A step of half an hour on the day clock. */
const TIME_STEP = 1 / 48;
const axis = (keys: DebugKeys, negative: string, positive: string): number =>
  (keys.isHeld(positive) ? 1 : 0) - (keys.isHeld(negative) ? 1 : 0);

/**
 * Frame system for debug mode. Keys: [ and ] step the time of day, \ stops the clock, F freezes the camera
 * (then I/K/J/L fly it and U/O lower and raise it). Also publishes the same controls as `window.__aquobble`.
 * Runs after the game's camera system so a held camera pose wins.
 */
export class DebugTools implements System {
  private frame = 0;

  constructor(
    private readonly clock: DebugClock,
    private readonly camera: DebugCamera,
    private readonly keys: DebugKeys,
    private readonly render: RenderStatsSource,
    private readonly groundHeight: (x: number, z: number) => number | null,
    target: { __aquobble?: DebugApi } = window as { __aquobble?: DebugApi },
  ) {
    target.__aquobble = this.api();
  }

  update(dt: number): void {
    this.frame++;
    const { keys, clock } = this;
    if (keys.consumePress('BracketLeft')) clock.setTimeOfDay(clock.timeOfDay - TIME_STEP);
    if (keys.consumePress('BracketRight')) clock.setTimeOfDay(clock.timeOfDay + TIME_STEP);
    if (keys.consumePress('Backslash')) clock.paused = !clock.paused;
    if (keys.consumePress('KeyF')) this.camera.toggle();
    this.camera.apply(dt, {
      forward: axis(keys, 'KeyK', 'KeyI'),
      right: axis(keys, 'KeyJ', 'KeyL'),
      up: axis(keys, 'KeyU', 'KeyO'),
    });
  }

  private api(): DebugApi {
    const api = {
      frame: 0,
      setTimeOfDay: (time: number) => this.clock.setTimeOfDay(time),
      pauseTime: (paused: boolean) => {
        this.clock.paused = paused;
      },
      setCamera: (position: Vec3, target: Vec3) => this.camera.hold(position, target),
      releaseCamera: () => this.camera.release(),
      groundHeight: this.groundHeight,
      stats: () => this.render.stats(),
    };
    // Read-through, so the page always sees the live frame count.
    Object.defineProperty(api, 'frame', { get: () => this.frame });
    return api;
  }
}
