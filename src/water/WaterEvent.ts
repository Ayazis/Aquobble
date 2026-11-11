/** Something touched the water; for audio (sloshes) and visual effects. Positions are world metres. */
export type WaterEvent =
  /** A foot came down in the water; `strength` grows with speed (0..1). */
  | { type: 'footstep'; x: number; y: number; z: number; strength: number }
  /** Something entered the water fast; `size` from impact speed and mass (about 0.2..2). */
  | { type: 'splash'; x: number; y: number; z: number; size: number }
  /** One arm stroke while swimming. */
  | { type: 'swimStroke'; x: number; y: number; z: number };

export type WaterEventType = WaterEvent['type'];
