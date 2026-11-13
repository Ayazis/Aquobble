import type { Vec3 } from '@core';
import { surfHeight } from './surf';
import type { WaveField } from './WaveField';

/**
 * The sea's waves all the way in: the open-water `swell` plus the surf that rolls up the beach, so things
 * floating or wading in the shallows rise with the waves that are drawn there. `stillDepth` is the depth of
 * the still water (tide included) at a spot, `seaState` how tall the surf runs right now.
 */
export class ShoreWaveField implements WaveField {
  constructor(
    private readonly swell: WaveField,
    private readonly stillDepth: (x: number, z: number) => number,
    private readonly seaState: () => number = () => 1,
  ) {}

  waveHeightAt(x: number, z: number, t: number): number {
    return this.swell.waveHeightAt(x, z, t) + surfHeight(this.stillDepth(x, z), x, z, t) * this.seaState();
  }

  /** The swell's normal: the surf is too low to tilt a floating thing much. */
  waveNormalAt(x: number, z: number, t: number): Vec3 {
    return this.swell.waveNormalAt(x, z, t);
  }
}
