import * as THREE from 'three';
import type { SurfaceStyler } from '@rendering';
import { cellLods } from './cellLods';
import type { ForestModelSet } from './ForestModelSet';
import { instancedParts } from './instancedParts';
import type { UnderstoryKind } from './UnderstoryKind';
import type { UnderstoryPlacement } from './UnderstoryPlacement';

/** Side of a map cell in metres. */
const CELL = 25;
const KINDS: readonly UnderstoryKind[] = ['bush', 'townBush', 'fern', 'plant', 'mushroom', 'mossLog', 'log', 'stump'];
/** Small things cast no shadow: the ground shade and their own darker undersides carry the contact. */
const SHADOWLESS = new Set<UnderstoryKind>(['fern', 'plant', 'mushroom']);

/**
 * Draws bushes, ferns, mushrooms, logs and stumps: per 25 m cell one instanced mesh per kind per part,
 * hidden once the cell is `nearDistance` metres away (there is no far level). The untextured logs and
 * stump get the shared bark detail.
 */
export class UnderstoryInstancesFactory {
  constructor(
    private readonly models: ForestModelSet,
    private readonly nearDistance: number,
    surfaces?: SurfaceStyler,
  ) {
    for (const kind of ['mossLog', 'log', 'stump'] as const) {
      for (const part of models.get(kind) ?? [])
        if (!('map' in part.material && part.material.map)) surfaces?.apply(part.material, 'bark');
    }
  }

  create(placements: readonly UnderstoryPlacement[]): THREE.Group {
    return cellLods(
      placements.filter((p) => this.models.has(p.kind)),
      CELL,
      this.nearDistance,
      (cell) => this.near(cell),
      () => new THREE.Object3D(),
    );
  }

  private near(cell: readonly UnderstoryPlacement[]): THREE.Group {
    const group = new THREE.Group();
    for (const kind of KINDS) {
      const items = cell.filter((p) => p.kind === kind);
      const parts = this.models.get(kind);
      if (!parts || items.length === 0) continue;
      const meshes = instancedParts(parts, items, (p, _part, color) => color.setScalar(0.85 + p.tint * 0.3));
      for (const mesh of meshes) mesh.castShadow = !SHADOWLESS.has(kind);
      group.add(...meshes);
    }
    return group;
  }
}
