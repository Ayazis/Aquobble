import { describe, expect, it } from 'vitest';
import { locomotionClip } from './locomotionClip';

describe('locomotionClip', () => {
  it('idles when standing still', () => expect(locomotionClip(0, 4, 8)).toBe('idle'));
  it('walks at walk speed', () => expect(locomotionClip(4, 4, 8)).toBe('walk'));
  it('runs at run speed', () => expect(locomotionClip(8, 4, 8)).toBe('run'));
});
