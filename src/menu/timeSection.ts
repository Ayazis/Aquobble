import { button, el, markActive, section } from './menuControls';
import type { MenuTargets } from './MenuTargets';
import type { SettingsStore } from './SettingsStore';

const QUICK: readonly [string, number][] = [
  ['Dawn', 6],
  ['Noon', 12],
  ['Dusk', 18.5],
  ['Night', 0],
];

const label = (hours: number): string => {
  const h = Math.floor(hours) % 24;
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Time of day: a 0-24 h slider, quick presets and a freeze toggle. `refresh` follows the running clock. */
export function timeSection(t: MenuTargets, store: SettingsStore): { element: HTMLElement; refresh(): void } {
  const slider = el('input', { flex: '1 1 160px', accentColor: '#ffd278' });
  Object.assign(slider, { type: 'range', min: '0', max: '24', step: '0.05' });
  slider.setAttribute('aria-label', 'Time of day');
  const readout = el('span', { font: '14px ui-monospace, monospace', minWidth: '44px' });
  const freeze = button('Freeze time', () => {
    t.clock.paused = !t.clock.paused;
    remember();
    refresh();
  });
  const setHours = (hours: number) => {
    t.clock.setTimeOfDay((((hours / 24) % 1) + 1) % 1);
    remember();
    refresh();
  };
  const remember = () => store.update({ frozenTime: t.clock.paused ? t.clock.timeOfDay : null });
  slider.addEventListener('input', () => setHours(Number(slider.value)));
  const quick = QUICK.map(([name, hours]) => button(name, () => setHours(hours)));
  const refresh = () => {
    const hours = t.clock.timeOfDay * 24;
    if (document.activeElement !== slider) slider.value = String(hours);
    readout.textContent = label(hours);
    markActive(freeze, t.clock.paused);
  };
  refresh();
  const element = el('div', { display: 'flex', flexDirection: 'column', gap: '10px' });
  element.append(section('Time of day', slider, readout), section('', ...quick, freeze));
  return { element, refresh };
}
