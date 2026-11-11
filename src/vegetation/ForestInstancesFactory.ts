import * as THREE from 'three';
import { applyCrownRim } from './applyCrownRim';
import { applyCrownSway, type CrownSwayClock } from './applyCrownSway';
import { cellLods } from './cellLods';
import type { ForestModelSet } from './ForestModelSet';
import { instancedParts } from './instancedParts';
import type { TreeInstancesFactory } from './TreeInstancesFactory';
import type { TreePlacement } from './TreePlacement';
import type { TreeSpecies } from './TreeSpecies';

/** Side of a map cell in metres; each cell is drawn, swapped to its far level, or culled on its own. */
const CELL = 40;
/** Local height (m) where each model's leaves start; nothing below it sways. */
const CROWN_BASE: Readonly<Record<TreeSpecies, number>> = {
  pineSmall: 1.4,
  pineTall: 2.4,
  oakRound: 2.3,
  oakTall: 2.5,
  dead: 99,
};
const SPECIES: readonly TreeSpecies[] = ['pineSmall', 'pineTall', 'oakRound', 'oakTall', 'dead'];

/**
 * Draws the forest from the tree models: per 40 m cell, one instanced mesh per species per part (bark,
 * leaves) up close, and the cheap stand-in trees from `standIns` once the cell is `nearDistance` metres
 * away. Leaves sway on the grass's gust front and get a lit rim on the sun side. A species without a
 * model is drawn as stand-ins at every distance.
 */
export class ForestInstancesFactory {
  constructor(
    private readonly models: ForestModelSet,
    private readonly standIns: TreeInstancesFactory,
    private readonly nearDistance: number,
    sway?: CrownSwayClock,
  ) {
    for (const species of SPECIES) {
      for (const part of models.get(species) ?? []) {
        if (part.role !== 'leaves') continue;
        if (sway) applyCrownSway(part.material, sway, CROWN_BASE[species]);
        applyCrownRim(part.material);
      }
    }
  }

  create(placements: readonly TreePlacement[]): THREE.Group {
    return cellLods(
      placements,
      CELL,
      this.nearDistance,
      (cell) => this.near(cell),
      (cell) => this.standIns.create(cell),
    );
  }

  private near(cell: readonly TreePlacement[]): THREE.Group {
    const group = new THREE.Group();
    const missing: TreePlacement[] = [];
    for (const species of SPECIES) {
      const trees = cell.filter((p) => p.species === species);
      const parts = this.models.get(species);
      if (trees.length === 0) continue;
      if (!parts) {
        missing.push(...trees);
        continue;
      }
      const meshes = instancedParts(parts, trees, (p, part, color) => {
        // Leaves drift from a cool deep green to a warmer, lighter one; bark only lightens or darkens.
        if (part.role === 'leaves') color.setRGB(0.82 + p.tint * 0.3, 0.92 + p.tint * 0.12, 0.8 + (1 - p.tint) * 0.1);
        else color.setScalar(0.85 + p.tint * 0.3);
      });
      group.add(...meshes);
    }
    if (missing.length) group.add(this.standIns.create(missing));
    return group;
  }
}
