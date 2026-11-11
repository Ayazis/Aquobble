/**
 * The shapes a decorative rock comes in: `boulder` is a large chiselled block, `stone` its cheaper small
 * cousin, `slab` a flat ledge and `pebbles` a handful of small stones lying together.
 */
export type RockFamily = 'boulder' | 'stone' | 'slab' | 'pebbles';

export const ROCK_FAMILIES: readonly RockFamily[] = ['boulder', 'stone', 'slab', 'pebbles'];
