/**
 * Component (2.11): how wet a character is. Written by `WetnessSystem`; the wet look and drips read it, and
 * anything else that wets characters (rain, weather lane) may raise `amount` and `line` too.
 */
export interface Wetness {
  /** Height (m) above the feet up to which the character is wet. */
  line: number;
  /** 1 fully wet, drying to 0 over `WetnessSystem`'s drying time. */
  amount: number;
  /** Seconds since the character left the water (0 while in it); drips fall for the first few. */
  sinceLeft: number;
  /** World height of the feet, for the wet line in world space. */
  feetY: number;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    wetness?: Wetness;
  }
}
