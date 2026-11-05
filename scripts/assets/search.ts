// npm run assets:search -- <source|all> <query> [--type hdris|textures|models] [--license cc0] [--max-tris 5000]
// "all" (or no known source) searches the local catalog plus every online source in parallel,
// skipping any source that fails or lacks an API key.
import { loadCatalog, matches } from './catalogLib';
import { parseArgs } from './lib';
import type { SearchHit } from './sources';
import { sourceOrDie, sources } from './sources';

const { pos, flags } = parseArgs();
const limit = Number(flags.limit ?? 30);

if (pos[0] && pos[0] !== 'all' && sources[pos[0]]) {
  const [src, ...q] = pos;
  const hits = await sourceOrDie(src).search(q.join(' '), flags);
  console.table(hits.slice(0, limit));
  console.log(`${hits.length} result(s). Fetch with: npm run assets:fetch -- ${src} <id>`);
} else {
  const query = (pos[0] === 'all' ? pos.slice(1) : pos).join(' ');
  const maxTris = flags['max-tris'] ? Number(flags['max-tris']) : Infinity;
  const online = ['polypizza', 'sketchfab', 'polyhaven', 'ambientcg'];
  const settled = await Promise.allSettled(
    online.map((s) => sources[s].search(s === 'sketchfab' ? `low poly ${query}` : query, flags)),
  );
  const rows: (SearchHit & { source: string })[] = [];
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') rows.push(...r.value.map((h) => ({ source: online[i], ...h })));
    else console.warn(`! ${online[i]} skipped: ${String(r.reason?.message ?? r.reason).split('\n')[0]}`);
  });
  const local = loadCatalog().filter((e) => e.source === 'local' && matches(e, query));
  rows.unshift(...local.map((e) => ({ source: 'local', id: e.fetch, name: e.name, kind: e.kind, license: e.license })));

  const licOk = (l: string) => !/\b(nc|nd)\b|noncommercial|noderiv/i.test(l);
  const cc0 = (l: string) => /cc0|public/i.test(l);
  const tris = (k: string) => Number(/(\d+)f/.exec(k)?.[1] ?? 0);
  const ranked = rows
    .filter((r) => licOk(r.license) && (!flags.license || flags.license !== 'cc0' || cc0(r.license)))
    .filter((r) => tris(r.kind) <= maxTris)
    .sort(
      (a, b) =>
        Number(b.source === 'local') - Number(a.source === 'local') || Number(cc0(b.license)) - Number(cc0(a.license)),
    );
  console.table(ranked.slice(0, limit));
  console.log(`${ranked.length} result(s) across ${new Set(ranked.map((r) => r.source)).size} source(s).`);
  console.log('Fetch with: npm run assets:fetch -- <source> <id>  (local rows are already on disk)');
  console.log('Browse thumbnails offline: assets/catalog/index.html (build with npm run assets:catalog)');
}
