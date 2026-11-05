import type { Random } from '@core';

/** A few seconds of looping white noise, generated from the injected Random. */
export function createNoiseBuffer(ctx: BaseAudioContext, random: Random, seconds = 4): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = random.range(-1, 1);
  return buffer;
}
