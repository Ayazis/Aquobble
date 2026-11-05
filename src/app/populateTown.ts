import type { GameWorld } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type { HeightField } from '@terrain';
import {
  BuildingSpawner,
  DEFAULT_TOWN_LAYOUT,
  ModelPlotSpawner,
  PlotBoxSpawner,
  PropSpawner,
  RoadMeshFactory,
  TownPlanner,
  TownSpawner,
  WallFactory,
  type TownSite,
} from '@town';
import type { ExclusionZone } from '@vegetation';

/**
 * Levels the terrain under the town (must run before the terrain mesh and collider are built),
 * then spawns roads, wall, buildings and props (models, grey boxes where a model is missing). Returns the area to keep free of trees.
 */
export function populateTown(
  world: GameWorld,
  physics: PhysicsEngine,
  terrain: HeightField,
  site: TownSite,
  models: ReadonlyMap<string, Object3D>,
): ExclusionZone {
  const planner = new TownPlanner(DEFAULT_TOWN_LAYOUT);
  const region = planner.region(site);
  terrain.flatten(region, planner.level(terrain, site));

  const town = planner.place(terrain, site);
  new TownSpawner(world, physics, new RoadMeshFactory(), new WallFactory()).spawn(town);
  const plots = new ModelPlotSpawner(world, physics, models, new PlotBoxSpawner(world, physics));
  new BuildingSpawner(plots).spawn(town);
  new PropSpawner(plots).spawn(town);

  const half = region.halfSize + 2;
  return { minX: site.x - half, maxX: site.x + half, minZ: site.z - half, maxZ: site.z + half };
}
