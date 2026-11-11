import type { TreeSpecies } from './TreeSpecies';

/** Collider trunk per species at scale 1 (metres), measured from the models' bark below the first branches. */
export const TREE_TRUNKS: Readonly<Record<TreeSpecies, { height: number; radius: number }>> = {
  pineSmall: { height: 4, radius: 0.3 },
  pineTall: { height: 4, radius: 0.32 },
  oakRound: { height: 3, radius: 0.32 },
  oakTall: { height: 3.5, radius: 0.34 },
  dead: { height: 5, radius: 0.45 },
};
