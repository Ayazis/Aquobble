import type { RoadNetwork } from './RoadNetwork';
import type { TownRoad } from './TownRoad';
import type { RoadKind } from './TownStreet';
import type { WallSide } from './TownWall';

export const WALL_HALF = 24;
export const PLAZA_HALF = 5.5;
export const ROAD_WIDTH = 3;

const street = (name: WallSide, kind: RoadKind, dx: number, dz: number) => ({
  name,
  kind,
  width: ROAD_WIDTH,
  gate: name,
  points: [
    { x: dx * PLAZA_HALF, z: dz * PLAZA_HALF },
    { x: dx * WALL_HALF, z: dz * WALL_HALF },
  ],
});

/** The village's roads: a north-south main street and an east-west lane crossing at the square, one gate each. */
export const DEFAULT_ROAD_NETWORK: RoadNetwork = {
  streets: [
    street('north', 'main', 0, 1),
    street('south', 'main', 0, -1),
    street('east', 'lane', 1, 0),
    street('west', 'lane', -1, 0),
  ],
  square: [
    { x: -PLAZA_HALF, z: -PLAZA_HALF },
    { x: PLAZA_HALF, z: -PLAZA_HALF },
    { x: PLAZA_HALF, z: PLAZA_HALF },
    { x: -PLAZA_HALF, z: PLAZA_HALF },
  ],
};

/** Each street's segments as the axis-aligned road strips the mesh, puddles and grass read. */
export function roadStrips(network: RoadNetwork): TownRoad[] {
  return network.streets.flatMap((s) =>
    s.points.slice(1).map((to, i) => ({ from: { ...s.points[i] }, to: { ...to }, width: s.width, kind: s.kind })),
  );
}
