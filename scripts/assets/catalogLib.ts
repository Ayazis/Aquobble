// Local preview catalog: metadata + thumbnails for browsing assets offline. Lives in assets/catalog/ (gitignored).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, UA } from './lib';

export const CATALOG_DIR = path.join(ROOT, 'assets/catalog');
export const CATALOG_JSON = path.join(CATALOG_DIR, 'catalog.json');
export const THUMBS_DIR = path.join(CATALOG_DIR, 'thumbs');

export interface CatalogEntry {
  source: string;
  id: string;
  name: string;
  kind: string;
  license: string;
  author?: string;
  url: string;
  tags: string[];
  /** Browsing categories (e.g. "fabric", "furniture", "nature"), lower-case. */
  cats?: string[];
  tris?: number;
  animated?: boolean;
  /** Remote thumbnail URL (downloaded into thumbs/). */
  thumbUrl?: string;
  /** Thumbnail path relative to CATALOG_DIR, once downloaded. */
  thumb?: string;
  /** How to get it: an assets:fetch command or a local path. */
  fetch: string;
}

export const key = (e: Pick<CatalogEntry, 'source' | 'id'>) => `${e.source}/${e.id}`;

export function loadCatalog(): CatalogEntry[] {
  if (!fs.existsSync(CATALOG_JSON)) return [];
  return JSON.parse(fs.readFileSync(CATALOG_JSON, 'utf8'));
}

export function saveCatalog(entries: CatalogEntry[]) {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
  entries.sort((a, b) => key(a).localeCompare(key(b)));
  fs.writeFileSync(CATALOG_JSON, JSON.stringify(entries, null, 1) + '\n');
}

/** Merge new entries over old ones (same source/id wins from `fresh`, keeping an already-downloaded thumb). */
export function merge(old: CatalogEntry[], fresh: CatalogEntry[]): CatalogEntry[] {
  const map = new Map(old.map((e) => [key(e), e]));
  for (const e of fresh) map.set(key(e), { ...e, thumb: e.thumb ?? map.get(key(e))?.thumb });
  return [...map.values()];
}

/** Every query word must appear in name, tags, kind, source or author. */
export function matches(e: CatalogEntry, query: string): boolean {
  const hay = [e.name, e.kind, e.source, e.author ?? '', ...e.tags].join(' ').toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

/** Download missing thumbnails with a small worker pool. Failures are skipped, not fatal. */
export async function downloadThumbs(entries: CatalogEntry[], concurrency = 8) {
  const todo = entries.filter((e) => e.thumbUrl && !(e.thumb && fs.existsSync(path.join(CATALOG_DIR, e.thumb))));
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
  let done = 0;
  let failed = 0;
  const worker = async () => {
    for (let e = todo.shift(); e; e = todo.shift()) {
      const src = e.thumbUrl ?? '';
      const ext = path.extname(new URL(src).pathname) || '.jpg';
      const rel = path.posix.join('thumbs', e.source, e.id.replace(/[^\w.-]+/g, '_') + ext);
      try {
        const dest = path.join(CATALOG_DIR, rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        if (src.startsWith('file:')) fs.copyFileSync(fileURLToPath(src), dest);
        else {
          const res = await fetch(src, { headers: { 'User-Agent': UA } });
          if (!res.ok) throw new Error(String(res.status));
          fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
        }
        e.thumb = rel;
      } catch {
        failed++;
      }
      if (++done % 100 === 0) console.log(`  thumbs: ${done} downloaded…`);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(`  thumbs: ${done - failed} new, ${failed} failed`);
}
