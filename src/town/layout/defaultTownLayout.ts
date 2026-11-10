import type { TownLayout } from './TownLayout';
import { TOWN_BUILDINGS } from './townBuildings';
import { TOWN_PROPS } from './townProps';

const WALL = 24;
const PLAZA = 5.5;
const ROAD_WIDTH = 3;

/** The handmade 52 x 52 m walled village: a small square, four narrow lanes out to four gates. */
export const DEFAULT_TOWN_LAYOUT: TownLayout = {
  size: 52,
  plazaHalfSize: PLAZA,
  roads: [
    { from: { x: 0, z: PLAZA }, to: { x: 0, z: WALL }, width: ROAD_WIDTH },
    { from: { x: 0, z: -PLAZA }, to: { x: 0, z: -WALL }, width: ROAD_WIDTH },
    { from: { x: PLAZA, z: 0 }, to: { x: WALL, z: 0 }, width: ROAD_WIDTH },
    { from: { x: -PLAZA, z: 0 }, to: { x: -WALL, z: 0 }, width: ROAD_WIDTH },
  ],
  wall: {
    halfSize: WALL,
    thickness: 1.4,
    height: 3.5,
    gates: (['north', 'south', 'east', 'west'] as const).map((side) => ({ side, width: ROAD_WIDTH + 1 })),
  },
  buildings: TOWN_BUILDINGS,
  props: TOWN_PROPS,
};
