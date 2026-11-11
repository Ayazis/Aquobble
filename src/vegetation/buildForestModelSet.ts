import type * as THREE from 'three';
import type { ForestModelSet } from './ForestModelSet';
import { modelParts } from './modelParts';
import type { ModelPart } from './ModelPart';
import type { TreeSpecies } from './TreeSpecies';
import type { UnderstoryKind } from './UnderstoryKind';

/** Node names in `models/forest.glb` (Quaternius, merged by `npm run assets:use -- ... --keep-nodes`). */
const NODES: Readonly<Partial<Record<TreeSpecies | UnderstoryKind, string>>> = {
  pineSmall: 'Pine_5',
  pineTall: 'Pine_4',
  oakRound: 'CommonTree_5',
  oakTall: 'CommonTree_3',
  dead: 'DeadTree_2',
  bush: 'Bush_Common',
  fern: 'Fern_1',
  plant: 'Plant_1_Big',
  mushroom: 'Mushroom_Common',
  mossLog: 'WoodLog_Moss',
  log: 'WoodLog',
  stump: 'TreeStump_Moss',
};

/** Picks the forest pack (and the town's bush model, if given) apart into parts per species and kind. */
export function buildForestModelSet(pack: THREE.Object3D | null, townBush: THREE.Object3D | null): ForestModelSet {
  const set = new Map<TreeSpecies | UnderstoryKind, readonly ModelPart[]>();
  if (pack) {
    pack.updateMatrixWorld(true);
    for (const [key, name] of Object.entries(NODES) as [TreeSpecies | UnderstoryKind, string][]) {
      const node = pack.getObjectByName(name);
      if (node) set.set(key, modelParts(node));
    }
  }
  if (townBush) set.set('townBush', modelParts(townBush));
  return set;
}
