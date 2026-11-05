export type WallSide = 'north' | 'south' | 'east' | 'west';

/** A gap in the wall, centred on one side. */
export interface TownGate {
  side: WallSide;
  width: number;
}

/** Square curtain wall around the town, centred on the town origin. */
export interface TownWall {
  /** Distance from the centre to the middle of the wall. */
  halfSize: number;
  thickness: number;
  height: number;
  gates: TownGate[];
}
