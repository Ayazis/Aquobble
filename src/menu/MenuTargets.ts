import type { WeatherMix } from '@weather';

/** What the pause menu drives; wired to the concrete game in `app/installMenu`. */
export interface MenuTargets {
  /** The day clock: time of day in [0, 1). */
  clock: { readonly timeOfDay: number; setTimeOfDay(time: number): void; paused: boolean };
  /** Stops the simulation while the menu is open. */
  setPaused(paused: boolean): void;
  weather: { override: WeatherMix | null };
  audio: { readonly isMuted: boolean; toggleMute(): void; onChange?: (muted: boolean) => void };
  setOutlines(on: boolean): void;
  /** Draw counts of the last frame, if the renderer offers them. */
  stats?(): { calls: number; triangles: number };
}
