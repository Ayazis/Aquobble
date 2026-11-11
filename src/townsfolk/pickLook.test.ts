import { describe, expect, it } from 'vitest';
import { SeededRandom } from '@core';
import { pickLook } from './pickLook';
import { lookColours } from './lookColours';

/** The player's (original) palette colours for the hair and garment swatches. */
const PLAYER = [0x8e7941, 0xb89f75, 0x6b8248, 0x6e6f5a, 0x4f7b7a, 0xa9a989, 0x4e4b3e, 0x824d46];

describe('pickLook', () => {
  it('is reproducible for a seed', () => {
    expect(pickLook(new SeededRandom(7))).toEqual(pickLook(new SeededRandom(7)));
  });

  it('never gives a villager one of the player colours', () => {
    const all = [...lookColours.hair, ...lookColours.skin, ...lookColours.cloth];
    for (const colour of PLAYER) expect(all).not.toContain(colour);
  });

  it('keeps neighbouring garments different and varies across villagers', () => {
    const random = new SeededRandom(3);
    const looks = Array.from({ length: 40 }, () => pickLook(random));
    for (const l of looks) {
      const cloth = [l.clothA, l.clothB, l.clothC, l.clothD, l.clothE, l.clothF];
      for (let i = 1; i < 6; i++) expect(cloth[i]).not.toBe(cloth[i - 1]);
    }
    expect(new Set(looks.map((l) => JSON.stringify(l))).size).toBe(40);
  });
});
