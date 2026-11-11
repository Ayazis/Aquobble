import { el } from './menuControls';
import type { LoadingProgress } from './LoadingProgress';

/** Full-screen title card with a progress bar, shown while the game loads; fades out on `finish`. */
export class LoadingScreen implements LoadingProgress {
  private readonly root: HTMLDivElement;
  private readonly bar: HTMLDivElement;
  private readonly status: HTMLDivElement;
  private shown = 0;

  constructor(container: HTMLElement) {
    this.root = el('div', {
      ...{ position: 'fixed', inset: '0', zIndex: '50', display: 'flex', flexDirection: 'column' },
      ...{ alignItems: 'center', justifyContent: 'center', gap: '18px', color: '#fff', textAlign: 'center' },
      ...{ font: '14px/1.4 system-ui, sans-serif', transition: 'opacity 0.8s ease' },
      ...{ background: 'radial-gradient(ellipse at 50% 40%, #2f6f8f 0%, #163a52 55%, #0b1a26 100%)' },
      padding:
        'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    });
    this.root.setAttribute('role', 'progressbar');
    this.root.setAttribute('aria-label', 'Loading Aquobble');
    const title = el(
      'div',
      {
        ...{ font: '700 clamp(40px, 12vw, 84px)/1 system-ui, sans-serif', letterSpacing: '0.04em' },
        textShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
      },
      'Aquobble',
    );
    const track = el('div', {
      ...{ width: 'min(320px, calc(100vw - 64px))', height: '8px', borderRadius: '4px' },
      ...{ background: 'rgba(255, 255, 255, 0.15)', overflow: 'hidden' },
    });
    this.bar = el('div', {
      ...{ width: '0%', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
      background: 'linear-gradient(90deg, #8fd3f4, #ffd278)',
    });
    track.append(this.bar);
    this.status = el('div', { opacity: '0.75', minHeight: '1.4em' }, 'Starting…');
    this.root.append(title, track, this.status);
    container.appendChild(this.root);
  }

  step(label: string, fraction: number): void {
    // Never move backwards when parallel loads report out of order.
    this.shown = Math.max(this.shown, Math.min(1, Math.max(0, fraction)));
    this.bar.style.width = `${(this.shown * 100).toFixed(1)}%`;
    this.root.setAttribute('aria-valuenow', String(Math.round(this.shown * 100)));
    this.status.textContent = label;
  }

  /** Fades out after the next painted frame, then removes itself. */
  finish(): void {
    this.step('Ready', 1);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.root.style.opacity = '0';
        this.root.style.pointerEvents = 'none';
        setTimeout(() => this.root.remove(), 900);
      }),
    );
  }

  /** Shows a failure message instead of hanging on a frozen bar. */
  fail(): void {
    this.status.textContent = 'Something went wrong while loading. Please reload.';
  }
}
