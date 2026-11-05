/** Tunables for the bird flocks. */
export interface WildlifeConfig {
  flocks: number;
  minBirds: number;
  maxBirds: number;
  center: { x: number; z: number };
  /** Flock orbit centres are scattered this far (m) from `center`. */
  spread: number;
  minRadius: number;
  maxRadius: number;
  minHeight: number;
  maxHeight: number;
}

export const DEFAULT_WILDLIFE: WildlifeConfig = {
  flocks: 3,
  minBirds: 8,
  maxBirds: 15,
  center: { x: 0, z: 0 },
  spread: 30,
  minRadius: 25,
  maxRadius: 55,
  minHeight: 15,
  maxHeight: 40,
};
