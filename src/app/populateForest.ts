import type { GameWorld, Random } from '@core';
import { createWindSway } from '@grass';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import type { GroundShade, HeightSampler } from '@terrain';
import { ForestSpawner, TreeInstancesFactory, TreePlacer, type TreePlacerOptions } from '@vegetation';

/** Radii (m, at tree scale 1) and strengths of the shade a tree leaves on the ground map. */
const TRUNK_PATCH = { radius: 1.7, strength: 0.75 };
const CANOPY = { radius: 4.6, strength: 0.7 };

/** Spawns the forest with swaying crowns and records each tree's contact patch and canopy shade. */
export function populateForest(
  world: GameWorld,
  physics: PhysicsEngine,
  random: Random,
  terrain: HeightSampler,
  options: TreePlacerOptions,
  surfaces: SurfaceStyler,
  shade: GroundShade,
): void {
  const wind = createWindSway();
  const instances = new TreeInstancesFactory(surfaces, wind);
  const trees = new ForestSpawner(world, new TreePlacer(terrain, random), instances, physics, wind).spawn(options);
  for (const t of trees) {
    shade.stamp(t.x, t.z, TRUNK_PATCH.radius * t.scale, TRUNK_PATCH.strength, 'contact');
    shade.stamp(t.x, t.z, CANOPY.radius * t.scale, CANOPY.strength, 'canopy');
  }
}
