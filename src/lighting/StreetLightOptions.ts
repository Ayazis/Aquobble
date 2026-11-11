/** Every tunable of the town's night lighting. Colours are 0xRRGGBB. */
export interface StreetLightOptions {
  /** Sun height (sine of the day: 1 noon, 0 horizon) below which lamps start to glow, and where they are fully lit. */
  onBelowSunHeight: number;
  fullBelowSunHeight: number;
  /** Lamp glass: its own texture colour times this, at full night. Above 1 feeds the bloom on desktop. */
  lampGlow: number;
  /** Lit window panes: colour and brightness at full night. */
  windowColor: number;
  windowGlow: number;
  /** Painted pool of light under each lamp: radius in metres, height above the ground, colour, brightness. */
  poolRadius: number;
  poolLift: number;
  poolColor: number;
  poolStrength: number;
  /** Real point lights shared among the lamps nearest the player. 0 on phones. */
  lightCount: number;
  lightColor: number;
  lightIntensity: number;
  /** Reach in metres and falloff exponent of each real light. */
  lightReach: number;
  lightDecay: number;
  /** Metres over which a real light fades before it moves to another lamp. */
  lightBlend: number;
}

/** Desktop: four real lights, with dimmer painted pools since the lights brighten the ground too. */
export const DEFAULT_STREET_LIGHTS: StreetLightOptions = {
  onBelowSunHeight: 0.15,
  fullBelowSunHeight: -0.1,
  lampGlow: 2.2,
  windowColor: 0xffb060,
  windowGlow: 1.5,
  poolRadius: 4.5,
  poolLift: 0.12,
  // Warm but not orange: a saturated amber added to green grass reads as neon yellow-green.
  poolColor: 0xffc690,
  // Lower so the lamp pool on the town lawn stays warm, not neon (0.8).
  poolStrength: 0.18,
  lightCount: 4,
  lightColor: 0xffc590,
  lightIntensity: 9,
  lightReach: 11,
  lightDecay: 1.6,
  lightBlend: 4,
};
