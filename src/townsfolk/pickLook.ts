import type { Random } from '@core';
import type { CharacterLook } from './CharacterLook';
import { lookColours } from './lookColours';

const pick = (random: Random, list: readonly number[]) => list[Math.floor(random.next() * list.length)];

/**
 * A random villager look. Hair and skin come from their own lists; the six garment swatches draw from a
 * shared cloth list, with neighbouring garments kept different so an outfit reads as more than one colour.
 */
export function pickLook(random: Random): CharacterLook {
  const cloth: number[] = [];
  for (let i = 0; i < 6; i++) {
    let colour = pick(random, lookColours.cloth);
    if (i > 0 && colour === cloth[i - 1]) colour = lookColours.cloth[(lookColours.cloth.indexOf(colour) + 1) % 12];
    cloth.push(colour);
  }
  const [clothA, clothB, clothC, clothD, clothE, clothF] = cloth;
  return {
    hair: pick(random, lookColours.hair),
    skin: pick(random, lookColours.skin),
    clothA,
    clothB,
    clothC,
    clothD,
    clothE,
    clothF,
  };
}
