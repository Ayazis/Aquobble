// npm run assets:search -- <source> <query> [--type hdris|textures|models] [--license cc0]
import { parseArgs } from './lib';
import { sourceOrDie } from './sources';

const { pos, flags } = parseArgs();
const [src, ...q] = pos;
const hits = await sourceOrDie(src).search(q.join(' '), flags);
console.table(hits.slice(0, Number(flags.limit ?? 30)));
console.log(`${hits.length} result(s). Fetch with: npm run assets:fetch -- ${src} <id>`);
