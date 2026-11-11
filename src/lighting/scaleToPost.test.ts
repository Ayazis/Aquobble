import { describe, expect, it } from 'vitest';
import { DEFAULT_STREET_LIGHTS } from './StreetLightOptions';
import { scaleToPost } from './scaleToPost';

describe('scaleToPost', () => {
  it('keeps the tuned values at the tuned post height and grows with taller posts', () => {
    expect(scaleToPost(DEFAULT_STREET_LIGHTS, 3.36).poolRadius).toBeCloseTo(DEFAULT_STREET_LIGHTS.poolRadius);
    expect(scaleToPost(DEFAULT_STREET_LIGHTS, 6.72).lightReach).toBeCloseTo(2 * DEFAULT_STREET_LIGHTS.lightReach);
  });
});
