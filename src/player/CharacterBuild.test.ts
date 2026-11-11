import { describe, expect, it } from 'vitest';
import { characterBuild } from './CharacterBuild';

describe('characterBuild', () => {
  it('makes a capsule exactly as tall as the character', () => {
    const b = characterBuild(1.6);
    expect(2 * (b.halfHeight + b.radius)).toBeCloseTo(1.6);
  });

  it('scales every size with the height', () => {
    const small = characterBuild(1.5);
    const big = characterBuild(1.8);
    expect(big.radius / small.radius).toBeCloseTo(1.2);
    expect(big.bendRadius / small.bendRadius).toBeCloseTo(1.2);
    expect(big.maxCameraDistance / small.maxCameraDistance).toBeCloseTo(1.2);
  });
});
