import type { Random } from '@core';
import type { TreeSpecies } from './TreeSpecies';

/** Share of trees that are bare dead trunks, and of living trees that are saplings. */
const DEAD = 0.03;
const SAPLING = 0.12;

/**
 * Picks a species and size for a tree standing at `height01` (0 at the lowest allowed ground, 1 at the
 * highest): pines take over from oaks on the upper half, with a wide mixed band between. A few trees
 * are dead trunks, and some living ones are saplings (a third to under half size).
 */
export function pickTreeSpecies(height01: number, random: Random): { species: TreeSpecies; scale: number } {
  if (random.next() < DEAD) return { species: 'dead', scale: random.range(0.6, 0.9) };
  const t = Math.min(Math.max((height01 - 0.3) / 0.45, 0), 1);
  const pine = random.next() < t * t * (3 - 2 * t);
  const tall = random.next() < 0.5;
  const species: TreeSpecies = pine ? (tall ? 'pineTall' : 'pineSmall') : tall ? 'oakTall' : 'oakRound';
  const sapling = random.next() < SAPLING;
  return { species, scale: sapling ? random.range(0.3, 0.45) : random.range(0.75, 1.25) };
}
