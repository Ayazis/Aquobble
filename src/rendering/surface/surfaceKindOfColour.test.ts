import { describe, expect, it } from 'vitest';
import { surfaceKindOf } from './surfaceKindOf';
import { surfaceKindOfColour } from './surfaceKindOfColour';

describe('surfaceKindOfColour', () => {
  it('gives roofs, doors and footings their own grain', () => {
    expect(surfaceKindOfColour(0xb5523b)).toBe('masonry'); // red tile roof
    expect(surfaceKindOfColour(0x4a5a78)).toBe('masonry'); // slate roof
    expect(surfaceKindOfColour(0x6e4b2a)).toBe('wood'); // door
    expect(surfaceKindOfColour(0x7d756c)).toBe('stone'); // footing
  });

  it('keeps pale walls as plaster', () => {
    expect(surfaceKindOfColour(0xeae4d8)).toBe('plaster');
    expect(surfaceKindOfColour(0xe8d8a8)).toBe('plaster');
  });

  it('is used for palette materials only', () => {
    expect(surfaceKindOf('PaletteMaterial001', 0x6e4b2a)).toBe('wood');
    expect(surfaceKindOf('Rock', 0x6e4b2a)).toBe('stone');
    expect(surfaceKindOf('PaletteMaterial001')).toBe('plaster');
  });
});
