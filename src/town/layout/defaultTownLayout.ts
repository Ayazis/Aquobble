import type { TownLayout } from './TownLayout';
import { TOWN_BUILDINGS } from './townBuildings';
import { TOWN_PROPS } from './townProps';

const WALL = 58;
const PLAZA = 14;
const ROAD_WIDTH = 6;

/** The handmade 120 x 120 m town: a square in the middle, four roads out to four gates. */
export const DEFAULT_TOWN_LAYOUT: TownLayout = {
  size: 120,
  plazaHalfSize: PLAZA,
  roads: [
    { from: { x: 0, z: PLAZA }, to: { x: 0, z: WALL }, width: ROAD_WIDTH },
    { from: { x: 0, z: -PLAZA }, to: { x: 0, z: -WALL }, width: ROAD_WIDTH },
    { from: { x: PLAZA, z: 0 }, to: { x: WALL, z: 0 }, width: ROAD_WIDTH },
    { from: { x: -PLAZA, z: 0 }, to: { x: -WALL, z: 0 }, width: ROAD_WIDTH },
  ],
  wall: {
    halfSize: WALL,
    thickness: 1.6,
    height: 4,
    gates: (['north', 'south', 'east', 'west'] as const).map((side) => ({ side, width: ROAD_WIDTH + 1 })),
  },
  buildings: TOWN_BUILDINGS,
  props: TOWN_PROPS,
};
