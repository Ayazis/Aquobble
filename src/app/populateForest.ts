import { identityQuat, vec3, type GameWorld, type Random } from '@core';
import { createWindSway } from '@grass';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import type { GroundShade, HeightSampler } from '@terrain';
import type { Object3D } from 'three';
import {
  buildForestModelSet,
  EdgeBushPlacer,
  ForestFloorPlacer,
  ForestInstancesFactory,
  ForestSpawner,
  LeafLitterFactory,
  LeafLitterPlacer,
  TreeInstancesFactory,
  TreePlacer,
  UnderstoryInstancesFactory,
  type TreePlacerOptions,
} from '@vegetation';
import type { ForestDetail } from './ForestDetail';

/** Radii (m, at tree scale 1) and strengths of the shade a tree leaves on the ground map. */
const TRUNK_PATCH = { radius: 1.7, strength: 0.75 };
const CANOPY = { radius: 4.6, strength: 0.7 };
/** Leaf patches per tree (at scale 1) and how far under the crown they fall. */
const LITTER = { perTree: 9, radius: 3.6 };
/** Ferns, mushrooms, logs and stumps per grown tree, and how far from the trunk. */
const FLOOR = { perTree: 2.6, radius: 3.4 };
const EDGE_BUSHES = { maxNeighbours: 4, neighbourRadius: 9, perTree: 2 };
/** Shade under a log or stump, at its scale 1. */
const FLOOR_PATCH = { radius: 1.2, strength: 0.5 };

/**
 * Spawns the forest (tree models near, simple trees far, or the simple trees alone without `pack`),
 * records each tree's contact patch and canopy shade, drops leaf litter under the crowns, then scatters
 * the forest floor and edge bushes. All placement draws from `random`, in that order.
 */
export function populateForest(
  world: GameWorld,
  physics: PhysicsEngine,
  random: Random,
  terrain: HeightSampler,
  options: TreePlacerOptions & { detail: ForestDetail },
  surfaces: SurfaceStyler,
  shade: GroundShade,
  pack: Object3D | null,
  /** The town's models; its bush joins the forest edge. */
  townModels: ReadonlyMap<string, Object3D>,
): void {
  const wind = createWindSway();
  const set = buildForestModelSet(pack, townModels.get('bush') ?? null);
  const standIns = new TreeInstancesFactory(surfaces, wind);
  const instances = pack ? new ForestInstancesFactory(set, standIns, options.detail.treeDistance, wind) : standIns;
  const trees = new ForestSpawner(world, new TreePlacer(terrain, random), instances, physics, wind).spawn(options);
  for (const t of trees) {
    shade.stamp(t.x, t.z, TRUNK_PATCH.radius * t.scale, TRUNK_PATCH.strength, 'contact');
    if (t.species !== 'dead') shade.stamp(t.x, t.z, CANOPY.radius * t.scale, CANOPY.strength, 'canopy');
  }
  const litter = new LeafLitterPlacer(terrain, random).place(trees, LITTER);
  const floor = [
    ...new ForestFloorPlacer(terrain, random).place(trees, FLOOR),
    ...new EdgeBushPlacer(terrain, random).place(trees, EDGE_BUSHES),
  ];
  for (const f of floor) {
    if (f.kind === 'mossLog' || f.kind === 'log' || f.kind === 'stump')
      shade.stamp(f.x, f.z, FLOOR_PATCH.radius * f.scale, FLOOR_PATCH.strength, 'contact');
  }
  const understory = new UnderstoryInstancesFactory(set, options.detail.floorDistance, surfaces);
  for (const object of [new LeafLitterFactory().create(litter), understory.create(floor)]) {
    world.add({ transform: { position: vec3(), rotation: identityQuat() }, renderObject: { object } });
  }
}
