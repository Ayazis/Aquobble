import fs from 'node:fs';
import path from 'node:path';
import { SLICES } from './slices.config';

const src = path.join(import.meta.dirname, 'src');
const folders = fs
  .readdirSync(src, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('slices.config', () => {
  it('lists exactly the folders under src/', () => {
    expect([...SLICES].sort()).toEqual(folders.sort());
  });

  it.each(SLICES)('slice "%s" has an index.ts as its public API', (slice) => {
    expect(fs.existsSync(path.join(src, slice, 'index.ts'))).toBe(true);
  });
});
