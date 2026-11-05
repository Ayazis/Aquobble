// Local-first search tiers: assets already in the game, raw downloads, and the cached preview catalog.
import fs from 'node:fs';
import path from 'node:path';
import type { CatalogEntry } from './catalogLib';
import { loadCatalog, matches } from './catalogLib';
import { collectLibrary } from './catalogSources';
import { PUBLIC, walk } from './lib';

export type Tier = 'in-game' | 'downloaded' | 'catalog' | 'online';

export interface Row {
  tier: Tier;
  source: string;
  id: string;
  name: string;
  kind: string;
  license: string;
  author?: string;
}

/** Optimised assets already in public/assets/ (match on file path, plus CREDITS.md line for license). */
export function inGameHits(query: string): Row[] {
  if (!fs.existsSync(PUBLIC)) return [];
  const credits = fs.existsSync(path.join(PUBLIC, 'CREDITS.md'))
    ? fs.readFileSync(path.join(PUBLIC, 'CREDITS.md'), 'utf8').split('\n')
    : [];
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return walk(PUBLIC)
    .filter((f) => /\.(glb|gltf|hdr|exr|ktx2|webp|png|jpg)$/i.test(f))
    .map((f) => path.relative(PUBLIC, f).replace(/\\/g, '/'))
    .filter((rel) =>
      words.every((w) =>
        rel
          .toLowerCase()
          .replace(/[_\-/.]+/g, ' ')
          .includes(w),
      ),
    )
    .map((rel) => {
      const stem = path.basename(rel, path.extname(rel));
      const credit = credits.find((l) => l.includes(stem));
      return {
        tier: 'in-game' as const,
        source: 'public',
        id: `public/assets/${rel}`,
        name: stem.replace(/[_-]+/g, ' '),
        kind: path.extname(rel).slice(1),
        license: /cc0/i.test(credit ?? '') ? 'CC0' : /cc-?by/i.test(credit ?? '') ? 'CC-BY' : 'see CREDITS.md',
      };
    });
}

const toRow = (tier: Tier, e: CatalogEntry): Row => ({
  tier,
  source: e.source,
  id: e.source === 'local' ? e.fetch : e.id,
  name: e.name,
  kind: e.tris ? `${e.kind} ${e.tris}f` : e.kind,
  license: e.license,
  author: e.author,
});

/** Raw downloads in assets/library/ (scanned live, so it is never stale). */
export const downloadedHits = (query: string): Row[] =>
  collectLibrary()
    .filter((e) => matches(e, query))
    .map((e) => toRow('downloaded', e));

/** Cached online entries from assets/catalog/catalog.json (instant, works offline). */
export const catalogHits = (query: string): Row[] =>
  loadCatalog()
    .filter((e) => e.source !== 'local' && matches(e, query))
    .map((e) => toRow('catalog', e));
