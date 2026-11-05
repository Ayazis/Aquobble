export interface NoiseBedOptions {
  type: BiquadFilterType;
  frequency: number;
  q: number;
  gain: number;
  /** Slow LFO on the gain: rate in Hz and depth as a fraction of `gain`. */
  lfoRate: number;
  lfoDepth: number;
  /** LFO on the filter frequency, in Hz of swing. */
  filterSwing: number;
}

/** Looping filtered noise with slow LFOs on its gain and cut-off: wind or surf, depending on the options. */
export class NoiseBed {
  private readonly sources: AudioScheduledSourceNode[] = [];

  constructor(ctx: AudioContext, noise: AudioBuffer, destination: AudioNode, o: NoiseBedOptions) {
    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = o.type;
    filter.frequency.value = o.frequency;
    filter.Q.value = o.q;

    const gain = ctx.createGain();
    gain.gain.value = o.gain;

    source.connect(filter).connect(gain).connect(destination);
    this.lfo(ctx, o.lfoRate, o.gain * o.lfoDepth, gain.gain);
    this.lfo(ctx, o.lfoRate * 0.37, o.filterSwing, filter.frequency);
    source.start();
    this.sources.push(source);
  }

  stop(): void {
    for (const s of this.sources) s.stop();
  }

  private lfo(ctx: AudioContext, rate: number, depth: number, target: AudioParam): void {
    const osc = ctx.createOscillator();
    osc.frequency.value = rate;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    osc.connect(amount).connect(target);
    osc.start();
    this.sources.push(osc);
  }
}
