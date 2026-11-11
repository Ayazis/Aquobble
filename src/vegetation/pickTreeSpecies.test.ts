import { SeededRandom } from '@core';
import { pickTreeSpecies } from './pickTreeSpecies';

function share(height01: number, test: (species: string) => boolean): number {
  const random = new SeededRandom(5);
  let hits = 0;
  for (let i = 0; i < 1000; i++) if (test(pickTreeSpecies(height01, random).species)) hits++;
  return hits / 1000;
}

describe('pickTreeSpecies', () => {
  it('grows oaks low down and pines high up', () => {
    expect(share(0, (s) => s.startsWith('oak'))).toBeGreaterThan(0.9);
    expect(share(1, (s) => s.startsWith('pine'))).toBeGreaterThan(0.9);
  });

  it('keeps dead trunks rare and some trees small', () => {
    expect(share(0.5, (s) => s === 'dead')).toBeLessThan(0.06);
    const random = new SeededRandom(9);
    const scales = Array.from({ length: 500 }, () => pickTreeSpecies(0.5, random).scale);
    expect(scales.filter((s) => s < 0.5).length).toBeGreaterThan(30);
  });
});
