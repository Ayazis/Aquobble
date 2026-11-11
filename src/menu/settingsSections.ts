import { button, choiceGroup, el, markActive, section } from './menuControls';
import type { QualityChoice, WeatherChoice } from './MenuSettings';
import type { MenuTargets } from './MenuTargets';
import type { SettingsStore } from './SettingsStore';
import { weatherPreset } from './weatherPreset';

const WEATHER: readonly (readonly [WeatherChoice, string])[] = [
  ['auto', 'Auto'],
  ['clear', 'Clear'],
  ['overcast', 'Overcast'],
  ['rain', 'Rain'],
  ['mist', 'Mist'],
];
const SHADOWS: readonly (readonly [QualityChoice, string])[] = [
  ['auto', 'Auto'],
  ['off', 'Off'],
  ['low', 'Low'],
  ['high', 'High'],
];
const GRASS: readonly (readonly [QualityChoice, string])[] = [
  ['auto', 'Auto'],
  ['low', 'Low'],
  ['high', 'High'],
];

/** Weather override, graphics, FPS overlay and sound. */
export function settingsSections(
  t: MenuTargets,
  store: SettingsStore,
  setFps: (on: boolean) => void,
): { elements: HTMLElement[]; refresh(): void } {
  const s = store.settings;
  const weather = choiceGroup(
    WEATHER,
    () => s.weather,
    (w) => {
      store.update({ weather: w });
      t.weather.override = weatherPreset(w);
    },
  );
  const outlines = button('Outlines', () => {
    store.update({ outlines: !s.outlines });
    t.setOutlines(s.outlines);
    refresh();
  });
  const fps = button('FPS overlay', () => {
    store.update({ fps: !s.fps });
    setFps(s.fps);
    refresh();
  });
  const mute = button('Sound', () => {
    t.audio.toggleMute();
    t.audio.onChange?.(t.audio.isMuted);
    refresh();
  });
  const shadows = choiceGroup(
    SHADOWS,
    () => s.shadows,
    (v) => store.update({ shadows: v }),
  );
  const grass = choiceGroup(
    GRASS,
    () => s.grass,
    (v) => store.update({ grass: v }),
  );
  const note = el('div', { fontSize: '12px', opacity: '0.6' }, 'Shadows and grass apply on reload.');
  const refresh = () => {
    markActive(outlines, s.outlines);
    markActive(fps, s.fps);
    markActive(mute, !t.audio.isMuted);
    weather.refresh();
  };
  refresh();
  return {
    elements: [
      section('Weather', ...weather.buttons),
      section('Display', outlines, fps, mute),
      section('Shadows', ...shadows.buttons),
      section('Grass', ...grass.buttons),
      note,
    ],
    refresh,
  };
}
