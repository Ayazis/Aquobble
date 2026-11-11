import type { GameLoop } from '@core';
import type { AmbientAudio } from '@audio';
import type { DayNightSystem } from '@environment';
import { PauseMenu, type SettingsStore } from '@menu';
import type { PostProcessing, RenderContext } from '@rendering';
import type { Weather } from '@weather';

/** What the pause menu reaches into. */
export interface MenuSites {
  loop: GameLoop;
  dayNight: DayNightSystem;
  weather: Weather;
  audio: AmbientAudio;
  post: PostProcessing;
  render: RenderContext;
}

/** The Escape / ☰ pause menu: time of day, weather, graphics, FPS overlay and sound. */
export function installMenu(container: HTMLElement, store: SettingsStore, s: MenuSites): PauseMenu {
  return new PauseMenu(
    container,
    {
      clock: s.dayNight,
      setPaused: (paused) => (s.loop.paused = paused),
      weather: s.weather,
      audio: s.audio,
      setOutlines: (on) => s.post.setOutlines(on),
      stats: () => s.render.stats(),
    },
    store,
  );
}
