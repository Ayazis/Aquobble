import { describe, expect, it } from 'vitest';
import { isMetal, surfaceKindOf } from './surfaceKindOf';

describe('surfaceKindOf', () => {
  it('maps the names used by the town models', () => {
    expect(surfaceKindOf('DarkWood')).toBe('wood');
    expect(surfaceKindOf('Wood_Side')).toBe('wood');
    expect(surfaceKindOf('Brown')).toBe('wood');
    expect(surfaceKindOf('Rock')).toBe('stone');
    expect(surfaceKindOf('Texture_Leaves')).toBe('foliage');
    expect(surfaceKindOf('Hay')).toBe('foliage');
  });

  it('treats palette and unnamed materials as plaster', () => {
    expect(surfaceKindOf('PaletteMaterial001')).toBe('plaster');
    expect(surfaceKindOf('')).toBe('plaster');
  });

  it('leaves metal untextured and metallic', () => {
    expect(surfaceKindOf('Metal')).toBeNull();
    expect(isMetal('Metal')).toBe(true);
    expect(isMetal('Wood')).toBe(false);
  });
});
