// npm run assets:fetch -- <source> <id|url> [--res 2k] [--format hdr|exr]
// Downloads into assets/library/<source>/<id>/ (gitignored) with a meta.json for licensing.
import { parseArgs } from './lib';
import { sourceOrDie } from './sources';

const { pos, flags } = parseArgs();
const [src, ...ids] = pos;
if (!ids.length) {
  console.error('Usage: npm run assets:fetch -- <source> <id> [more ids] [--res 2k]');
  process.exit(1);
}
for (const id of ids) await sourceOrDie(src).fetch(id, flags);
