/** Height (m) where grass starts drying out, and how many metres it takes to turn fully dry. */
const DRY_FROM = 7.5;
const DRY_OVER = 4;
/** How far (m) the dry line wanders up and down across the island, so high ground dries in patches. */
const DRY_WANDER = 3;

/**
 * How dry and yellowed grass is at (x, z) on ground of height `y`, in [0, 1]: 0 on low ground, rising on
 * high ground in ragged patches some 20 to 40 m across (fixed sine phases, so every run gets the same ones).
 */
export function dryness(x: number, z: number, y: number): number {
  const wander = Math.sin(x * 0.17 + z * 0.05 + 0.6) * Math.sin(z * 0.19 - x * 0.07 + 1.3);
  const t = Math.min(Math.max((y - DRY_FROM + DRY_WANDER * wander) / DRY_OVER, 0), 1);
  return t * t * (3 - 2 * t);
}
