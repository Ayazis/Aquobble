import type { Random } from '@core';
import { DEFAULT_ROAD_NETWORK, PLAZA_HALF, ROAD_WIDTH, roadStrips, WALL_HALF } from './defaultRoadNetwork';
import { doorZone } from './doorZone';
import { roadRect } from './GroundRect';
import { Occupancy } from './Occupancy';
import { placeFrontages } from './placeFrontages';
import { placeYardProps } from './placeYardProps';
import { StreetFurniturePlacer } from './StreetFurniturePlacer';
import { OPEN_GROUND, SQUARE_PLOTS, TOWN_FRONTAGES } from './townFrontages';
import type { TownLayout } from './TownLayout';
import type { TownWall } from './TownWall';

const WALL: TownWall = {
  halfSize: WALL_HALF,
  thickness: 1.4,
  height: 3.5,
  gates: (['north', 'south', 'east', 'west'] as const).map((side) => ({ side, width: ROAD_WIDTH + 1 })),
};

/**
 * Lays the village out by code from its road network: square plots and corner landmarks first, then lanterns
 * at the square's corners and the gates, buildings fronting the streets, the remaining lanterns, benches,
 * signposts, and each building's own props. Same `random` stream, same town.
 */
export function buildTownLayout(random: Random): TownLayout {
  const network = DEFAULT_ROAD_NETWORK;
  const roads = roadStrips(network);
  const space = new Occupancy(WALL.halfSize - WALL.thickness / 2);
  for (const road of roads) space.block(roadRect(road));
  for (const plot of [...SQUARE_PLOTS, ...OPEN_GROUND]) space.take(plot, false);

  const furniture = new StreetFurniturePlacer(network, space, random.fork('furniture'));
  const anchors = furniture.anchorLamps();
  const fronting = placeFrontages(network, TOWN_FRONTAGES, space, random.fork('frontages'));
  const buildings = [...SQUARE_PLOTS, ...fronting, ...OPEN_GROUND];
  for (const b of fronting) space.keepClear(doorZone(b));

  const props = [
    ...anchors,
    ...furniture.fillLamps(),
    ...furniture.signposts(),
    ...furniture.benches(),
    ...placeYardProps(buildings, space, random.fork('yards')),
  ];
  return { size: 52, plazaHalfSize: PLAZA_HALF, network, roads, wall: WALL, buildings, props };
}
