/** Key colours for one hour of the day, 0xRRGGBB. The sky is a painted gradient from horizon to zenith. */
export interface HourColours {
  skyZenith: number;
  skyHorizon: number;
  sun: number;
  fog: number;
  /** Hemisphere fill from above (sky shade) and below (ground bounce). */
  shade: number;
  bounce: number;
}

/** Ground colours per biome, low to high, plus the bare earth of paths and banks. */
export interface BiomeColours {
  sand: number;
  meadow: number;
  forest: number;
  rock: number;
  snow: number;
  earth: number;
}

/** Swatches for buildings and props, grouped by what they are made of. */
export interface BuildingSwatches {
  plaster: readonly number[];
  timber: number;
  darkTimber: number;
  roof: number;
  stone: number;
  iron: number;
  hay: number;
  cloth: number;
  shrub: number;
}

/** The one colour script every slice reads from (see docs/colour-script.md). */
export interface ColourScript {
  night: HourColours;
  predawn: HourColours;
  dawn: HourColours;
  morning: HourColours;
  noon: HourColours;
  afternoon: HourColours;
  dusk: HourColours;
  nightfall: HourColours;
  biomes: BiomeColours;
  /** Grass tip gain per channel over the ground colour: cool (tint 0) and warm (tint 1). */
  grassTips: { cool: readonly number[]; warm: readonly number[] };
  buildings: BuildingSwatches;
}
