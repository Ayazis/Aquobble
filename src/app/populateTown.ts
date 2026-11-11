import type { GameWorld, Random } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type { SurfaceStyler } from '@rendering';
import type { GroundShadeUniforms, HeightField } from '@terrain';
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
import type { GrassBlocker } from '@grass';
import { spawnStreetLamps } from './spawnStreetLamps';
import { townGrassBlockers } from './townGrassBlockers';

/** What the rest of the world needs to know about the town once it stands. */
export interface TownGround {
  /** Keep free of trees, rocks and ponds. */
  area: ExclusionZone;
  /** Footprints nobody can walk through (buildings, props, wall), for route planning. */
  obstacles: TownObstacle[];
  /** Where grass cannot grow inside the town (it grows, mown short, everywhere else in `area`). */
  grassBlockers: GrassBlocker[];
}

/**
 * Levels the terrain under the town (must run before the terrain mesh and collider are built),
 * then spawns roads, wall, buildings and props (models, grey boxes where a model is missing). The roads read
 * the ground shade map and get their puddles from `ground.random`.
 */
export function populateTown(
  world: GameWorld,
  physics: PhysicsEngine,
  terrain: HeightField,
  site: TownSite,
  models: ReadonlyMap<string, Object3D>,
  surfaces: SurfaceStyler,
  ground?: { shade: GroundShadeUniforms; random: Random },
): TownGround {
  const planner = new TownPlanner(DEFAULT_TOWN_LAYOUT);
  const region = planner.region(site);
  terrain.flatten(region, planner.level(terrain, site));

  const town = planner.place(terrain, site);
  new TownSpawner(
    world,
    physics,
    new RoadMeshFactory(surfaces, ground?.shade, ground?.random),
    new WallFactory(surfaces),
  ).spawn(town);
  const plots = new ModelPlotSpawner(world, physics, models, new PlotBoxSpawner(world, physics));
  new BuildingSpawner(plots).spawn(town);
  new PropSpawner(plots).spawn(town);
  spawnStreetLamps(world, town.props);

  const half = region.halfSize + 2;
  const area = { minX: site.x - half, maxX: site.x + half, minZ: site.z - half, maxZ: site.z + half };
  const obstacles = townObstacles(town);
  return { area, obstacles, grassBlockers: townGrassBlockers(town, obstacles) };
}
