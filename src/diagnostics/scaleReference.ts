/** Character height in metres: the 1.8 m reference figure. */
export const CHARACTER_HEIGHT = 1.8;

/** The yardstick (graphics plan 6.1): a door is 1.25x character height. */
export const TARGET_DOOR_HEIGHT = CHARACTER_HEIGHT * 1.25;

/**
 * Measured door height of each building model at its current in-game size, in metres. Fill in from the
 * overlay (read the door against the pole marks); models not listed show only the target bar.
 */
export const MEASURED_DOOR_HEIGHTS: Readonly<Record<string, number>> = {};

/** Building models that get a door marker (props are left out). Matched against the model root's name. */
export const BUILDING_MODELS: readonly string[] = [
  'house_a',
  'house_b',
  'house_c',
  'tavern',
  'blacksmith',
  'chapel',
  'watchtower',
  'barracks',
  'windmill',
  'sawmill',
  'stable',
];
