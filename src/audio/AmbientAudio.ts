import type { Random, System } from '@core';
import { createNoiseBuffer } from './createNoiseBuffer';
import { NoiseBed } from './NoiseBed';
import { playChirp } from './playChirp';

const MASTER_VOLUME = 0.6;
const FADE = 0.4;

/**
 * Ambient soundscape (wind, surf, occasional bird calls) synthesized with Web Audio. Browsers block
 * audio until a user gesture, so the context starts on the first key or pointer press. M toggles mute.
 * Without an AudioContext (Node tests, old browsers) it does nothing.
 */
export class AmbientAudio implements System {
  private ctx?: AudioContext;
  private master?: GainNode;
  private beds: NoiseBed[] = [];
  private muted = false;
  private untilChirp = 3;
  /** Called after M toggles mute, so UI can follow. */
  onChange?: (muted: boolean) => void;

  constructor(
    private readonly random: Random,
    private readonly target: Window = window,
  ) {
    target.addEventListener('keydown', this.onKey);
    target.addEventListener('pointerdown', this.onGesture);
  }

  update(dt: number): void {
    if (!this.ctx || !this.master || this.muted) return;
    this.untilChirp -= dt;
    if (this.untilChirp > 0) return;
    playChirp(this.ctx, this.master, this.random);
    this.untilChirp = this.random.range(2.5, 9);
  }

  dispose(): void {
    this.target.removeEventListener('keydown', this.onKey);
    this.target.removeEventListener('pointerdown', this.onGesture);
    for (const bed of this.beds) bed.stop();
    this.beds = [];
    void this.ctx?.close();
    this.ctx = undefined;
  }

  private readonly onKey = (event: KeyboardEvent): void => {
    if (event.code === 'KeyM' && !event.repeat && this.ctx) this.toggleMute();
    this.onChange?.(this.muted);
    this.onGesture();
  };

  private readonly onGesture = (): void => {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    if (typeof AudioContext === 'undefined') return;
    this.start(new AudioContext());
  };

  private start(ctx: AudioContext): void {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.setValueAtTime(0, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : MASTER_VOLUME, ctx.currentTime + 3);
    this.master.connect(ctx.destination);
    const noise = createNoiseBuffer(ctx, this.random);
    this.beds = [
      // Wind: airy band-pass that wanders up and down.
      new NoiseBed(ctx, noise, this.master, {
        type: 'bandpass',
        frequency: 700,
        q: 0.6,
        gain: 0.12,
        lfoRate: 0.07,
        lfoDepth: 0.6,
        filterSwing: 350,
      }),
      // Surf: low-passed rumble that swells like waves rolling in.
      new NoiseBed(ctx, noise, this.master, {
        type: 'lowpass',
        frequency: 420,
        q: 0.4,
        gain: 0.22,
        lfoRate: 0.11,
        lfoDepth: 0.8,
        filterSwing: 180,
      }),
    ];
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Flips mute; works before audio has started (it then starts muted or audible accordingly). */
  toggleMute(): void {
    this.muted = !this.muted;
    if (!this.ctx) this.onGesture();
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : MASTER_VOLUME, now + FADE);
  }
}
