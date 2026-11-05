import type { Random } from '@core';

/** A short synthesized bird call: two to four quick sine sweeps with a fast attack/decay envelope. */
export function playChirp(ctx: AudioContext, destination: AudioNode, random: Random): void {
  const notes = Math.floor(random.range(2, 5));
  const base = random.range(2200, 4200);
  const pan = ctx.createStereoPanner();
  pan.pan.value = random.range(-0.8, 0.8);
  pan.connect(destination);
  const volume = random.range(0.03, 0.08);
  let t = ctx.currentTime + 0.02;
  for (let i = 0; i < notes; i++) {
    const length = random.range(0.05, 0.12);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const from = base * random.range(0.85, 1.15);
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(from * random.range(1.2, 1.6), t + length);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(env).connect(pan);
    osc.start(t);
    osc.stop(t + length + 0.02);
    t += length + random.range(0.03, 0.09);
  }
}
