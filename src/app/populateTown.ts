import type { GameWorld } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import type { HeightField } from '@terrain';
import {
  BuildingSpawner,
  DEFAULT_TOWN_LAYOUT,
  ModelPlotSpawner,
  PlotBoxSpawner,
  PropSpawner,
  RoadMeshFactory,
  TownPlanner,
  townObstacles,
  TownSpawner,
  WallFactory,
  type TownObstacle,
  type TownSite,
} from '@town';
import type { ExclusionZone } from '@vegetation';

/** What the rest of the world needs to know about the town once it stands. */
export interface TownGround {
  /** Keep free of trees, grass, rocks and ponds. */
  area: ExclusionZone;
  /** Footprints nobody can walk through (buildings, props, wall), for route planning. */
  obstacles: TownObstacle[];
}

/**
 * Levels the terrain under the town (must run before the terrain mesh and collider are built),
 * then spawns roads, wall, buildings and props (models, grey boxes where a model is missing).
 */
export function populateTown(
  world: GameWorld,
  physics: PhysicsEngine,
  terrain: HeightField,
  site: TownSite,
  models: ReadonlyMap<string, Object3D>,
  surfaces: SurfaceStyler,
): TownGround {
  const planner = new TownPlanner(DEFAULT_TOWN_LAYOUT);
  const region = planner.region(site);
  terrain.flatten(region, planner.level(terrain, site));

  const town = planner.place(terrain, site);
  new TownSpawner(world, physics, new RoadMeshFactory(), new WallFactory(surfaces)).spawn(town);
  const plots = new ModelPlotSpawner(world, physics, models, new PlotBoxSpawner(world, physics));
  new BuildingSpawner(plots).spawn(town);
  new PropSpawner(plots).spawn(town);

  const half = region.halfSize + 2;
  const area = { minX: site.x - half, maxX: site.x + half, minZ: site.z - half, maxZ: site.z + half };
  return { area, obstacles: townObstacles(town) };
}
