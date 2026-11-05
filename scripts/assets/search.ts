// npm run assets:search -- <source|all> <query> [--license cc0] [--max-tris 5000] [--offline] [--limit 30]
// "all" searches local first, in tiers: in-game (public/assets/) → downloaded (assets/library/) →
// catalog (cached preview catalog) → online (live APIs, minus what the catalog already listed).
// --offline skips the live APIs. A failing source or missing API key is skipped with a warning.
import type { Row } from './localHits';
import { catalogHits, downloadedHits, inGameHits } from './localHits';
import { parseArgs } from './lib';
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
  const rows: Row[] = [...inGameHits(query), ...downloadedHits(query), ...catalogHits(query)];

  if (flags.offline !== 'true') {
    const seen = new Set(rows.map((r) => `${r.source}/${r.id}`));
    const online = ['polypizza', 'sketchfab', 'polyhaven', 'ambientcg'];
    const settled = await Promise.allSettled(
      online.map((s) => sources[s].search(s === 'sketchfab' ? `low poly ${query}` : query, flags)),
    );
    settled.forEach((r, i) => {
      if (r.status === 'rejected')
        return console.warn(`! ${online[i]} skipped: ${String(r.reason?.message ?? r.reason).split('\n')[0]}`);
      for (const h of r.value)
        if (!seen.has(`${online[i]}/${h.id}`)) rows.push({ tier: 'online', source: online[i], ...h });
    });
  }

  const tierRank = ['in-game', 'downloaded', 'catalog', 'online'];
  const licOk = (l: string) => !/\b(nc|nd)\b|noncommercial|noderiv/i.test(l);
  const cc0 = (l: string) => /cc0|public/i.test(l);
  const tris = (k: string) => Number(/(\d+)f/.exec(k)?.[1] ?? 0);
  const maxTris = flags['max-tris'] ? Number(flags['max-tris']) : Infinity;
  const ranked = rows
    .filter((r) => licOk(r.license) && (flags.license !== 'cc0' || cc0(r.license)))
    .filter((r) => tris(r.kind) <= maxTris)
    .sort(
      (a, b) => tierRank.indexOf(a.tier) - tierRank.indexOf(b.tier) || Number(cc0(b.license)) - Number(cc0(a.license)),
    );

  console.table(ranked.slice(0, limit));
  const count = (t: string) => ranked.filter((r) => r.tier === t).length;
  console.log(tierRank.map((t) => `${t}: ${count(t)}`).join(' · '));
  if (count('in-game')) console.log('⚠ Already in the game: reuse it before fetching anything new.');
  console.log('Fetch with: npm run assets:fetch -- <source> <id>  (in-game/downloaded rows are already on disk)');
  console.log('Browse thumbnails offline: assets/catalog/index.html (refresh with npm run assets:catalog)');
}
