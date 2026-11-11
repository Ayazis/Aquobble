import { FpsMeter } from './FpsMeter';
import { MenuButton } from './MenuButton';
import { button, el } from './menuControls';
import type { MenuTargets } from './MenuTargets';
import { settingsSections } from './settingsSections';
import type { SettingsStore } from './SettingsStore';
import { timeSection } from './timeSection';
import { weatherPreset } from './weatherPreset';

/**
 * Pause and settings overlay. Escape (or the ☰ button) toggles it; while open the game is paused and keys never
 * reach the game. Applies the stored settings at start.
 */
export class PauseMenu {
  private readonly overlay: HTMLDivElement;
  private readonly fps: FpsMeter;
  private readonly menuButton: MenuButton;
  private readonly refreshers: (() => void)[] = [];
  private frameId: number | null = null;
  private open = false;

  constructor(
    container: HTMLElement,
    private readonly targets: MenuTargets,
    store: SettingsStore,
    private readonly target: Window = window,
  ) {
    const s = store.settings;
    if (s.frozenTime !== null) {
      targets.clock.setTimeOfDay(s.frozenTime);
      targets.clock.paused = true;
    }
    targets.weather.override = weatherPreset(s.weather);
    targets.setOutlines(s.outlines);
    this.fps = new FpsMeter(container, targets.stats);
    this.fps.setVisible(s.fps);

    this.overlay = el('div', {
      ...{ position: 'fixed', inset: '0', zIndex: '20', display: 'none' },
      ...{ alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.35)' },
    });
    const panel = el('div', {
      ...{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px', borderRadius: '12px' },
      ...{ width: 'min(440px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' },
      ...{ color: '#fff', font: '14px/1.3 system-ui, sans-serif', background: 'rgba(20, 24, 30, 0.85)' },
    });
    const time = timeSection(targets, store);
    const rest = settingsSections(targets, store, (on) => this.fps.setVisible(on));
    this.refreshers.push(time.refresh, rest.refresh);
    const resume = button('Resume', () => this.setOpen(false));
    resume.style.alignSelf = 'stretch';
    panel.append(el('div', { fontSize: '18px', fontWeight: '600' }, 'Paused'), time.element, ...rest.elements, resume);
    // Clicks inside the panel stay there; a click on the dim backdrop resumes.
    panel.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.overlay.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.overlay.addEventListener('click', (e) => e.target === this.overlay && this.setOpen(false));
    this.overlay.append(panel);
    container.appendChild(this.overlay);
    this.menuButton = new MenuButton(container, () => this.setOpen(!this.open));
    // Capture phase on the window runs before the game's own key listeners there.
    target.addEventListener('keydown', this.onKey, true);
    target.addEventListener('keyup', this.onKey, true);
  }

  get isOpen(): boolean {
    return this.open;
  }

  setOpen(open: boolean): void {
    if (open === this.open) return;
    this.open = open;
    this.overlay.style.display = open ? 'flex' : 'none';
    this.targets.setPaused(open);
    if (open) {
      if (document.pointerLockElement) document.exitPointerLock();
      this.frameId = requestAnimationFrame(this.tick);
    } else if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  dispose(): void {
    this.setOpen(false);
    this.target.removeEventListener('keydown', this.onKey, true);
    this.target.removeEventListener('keyup', this.onKey, true);
    this.overlay.remove();
    this.menuButton.dispose();
    this.fps.dispose();
  }

  private readonly onKey = (event: KeyboardEvent): void => {
    if (event.type === 'keydown' && event.code === 'Escape' && !event.repeat) {
      event.preventDefault();
      this.setOpen(!this.open);
      event.stopImmediatePropagation();
      return;
    }
    // Keyups still pass so the game never keeps a key held down.
    if (this.open && event.type === 'keydown') event.stopImmediatePropagation();
  };

  private readonly tick = (): void => {
    for (const refresh of this.refreshers) refresh();
    this.frameId = requestAnimationFrame(this.tick);
  };
}
