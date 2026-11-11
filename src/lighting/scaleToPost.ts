import type { StreetLightOptions } from './StreetLightOptions';

/** Post height (m) the default pool radius and light reach were tuned against. */
const TUNED_POST_HEIGHT = 3.36;

/** Grows the light pool and real-light reach in proportion to the lantern post's height. */
export function scaleToPost(options: StreetLightOptions, postHeight: number): StreetLightOptions {
  const k = postHeight / TUNED_POST_HEIGHT;
  return { ...options, poolRadius: options.poolRadius * k, lightReach: options.lightReach * k };
}
