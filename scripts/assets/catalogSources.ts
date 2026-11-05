// Collectors that fill the local preview catalog from each source.
import fs from 'node:fs';
import path from 'node:path';
import type { CatalogEntry } from './catalogLib';
import { LIBRARY, getJson, walk } from './lib';

/** Default crawl terms: things a low-poly outdoor/water world is likely to need. */
export const SEED_TERMS = (
  'house cabin hut cottage barn castle tower windmill lighthouse bridge dock pier fence wall gate well tent ' +
  'boat ship sailboat canoe raft plane airplane helicopter car truck train cart bicycle balloon ' +
  'tree pine palm bush flower grass mushroom rock stone cliff log stump plant cactus reed lily ' +
  'fish duck bird seagull frog turtle crab whale dolphin shark deer fox rabbit cow sheep horse chicken dog cat ' +
  'character person villager knight pirate farmer ' +
  'barrel crate chest bench table chair lamp lantern torch campfire sign flag bucket anchor buoy net ' +
  'cloud island beach volcano waterfall mountain sword shield axe pickaxe food coin key'
).split(' ');

const tagsOf = (...xs: (string | string[] | undefined | null)[]) => [
  ...new Set(
    xs
      .flat()
      .filter((x): x is string => !!x)
      .map((x) => x.toLowerCase()),
  ),
];

/** Poly Haven: the whole catalogue in one call (models, textures, HDRIs). */
export async function collectPolyhaven(): Promise<CatalogEntry[]> {
  const all = await getJson<Record<string, any>>('https://api.polyhaven.com/assets?type=all');
  const kinds = ['hdri', 'texture', 'model'];
  return Object.entries(all).map(([id, a]) => ({
    source: 'polyhaven',
    id,
    name: a.name,
    kind: kinds[a.type],
    license: 'CC0',
    author: Object.keys(a.authors ?? {}).join(', '),
    url: `https://polyhaven.com/a/${id}`,
    tags: tagsOf(a.tags, a.categories),
    cats: tagsOf(a.categories.filter((c: string) => !c.startsWith('collection'))),
    thumbUrl: `https://cdn.polyhaven.com/asset_img/thumbs/${id}.png?width=256&height=256`,
    fetch: `npm run assets:fetch -- polyhaven ${id}`,
  }));
}

/** Poly Pizza: no list endpoint, so crawl search pages per term. */
export async function collectPolypizza(terms: string[], pages: number): Promise<CatalogEntry[]> {
  const key = process.env.POLYPIZZA_API_KEY;
  if (!key) throw new Error('POLYPIZZA_API_KEY not set');
  const out: CatalogEntry[] = [];
  for (const t of terms) {
    for (let p = 0; p < pages; p++) {
      const r = await getJson<any>(`https://api.poly.pizza/v1.1/search/${encodeURIComponent(t)}?Limit=32&Page=${p}`, {
        'x-auth-token': key,
      });
      for (const m of r.results ?? [])
        out.push({
          source: 'polypizza',
          id: m.ID,
          name: m.Title,
          kind: 'model',
          license: m.Licence ?? '?',
          author: m.Creator?.Username,
          url: `https://poly.pizza/m/${m.ID}`,
          tags: tagsOf(m.Category, m.Tags, t),
          cats: tagsOf(m.Category),
          tris: m['Tri Count'],
          animated: !!m.Animated,
          thumbUrl: m.Thumbnail,
          fetch: `npm run assets:fetch -- polypizza ${m.ID}`,
        });
      if ((p + 1) * 32 >= (r.total ?? 0)) break;
    }
  }
  return out;
}

/** Sketchfab: downloadable CC0 + CC-BY models per term, following the `next` cursor. */
export async function collectSketchfab(terms: string[], pages: number): Promise<CatalogEntry[]> {
  const out: CatalogEntry[] = [];
  for (const t of terms) {
    for (const lic of ['cc0', 'by']) {
      let next: string | null =
        `https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=24&license=${lic}` +
        `&max_face_count=20000&q=${encodeURIComponent('low poly ' + t)}`;
      for (let p = 0; p < pages && next; p++) {
        const r: any = await getJson<any>(next);
        next = r.next;
        for (const m of r.results ?? []) {
          const imgs: any[] = m.thumbnails?.images ?? [];
          const img = imgs.filter((i) => i.width >= 200).sort((a, b) => a.width - b.width)[0] ?? imgs[0];
          out.push({
            source: 'sketchfab',
            id: m.uid,
            name: m.name,
            kind: 'model',
            license: m.license?.label ?? lic,
            author: m.user?.username,
            url: m.viewerUrl,
            tags: tagsOf(
              m.tags?.map((x: any) => x.name),
              m.categories?.map((x: any) => x.name),
              t,
            ),
            cats: tagsOf(m.categories?.map((x: any) => x.name)),
            tris: m.faceCount,
            animated: (m.animationCount ?? 0) > 0,
            thumbUrl: img?.url,
            fetch: `npm run assets:fetch -- sketchfab ${m.uid}`,
          });
        }
      }
    }
  }
  return out;
}

/** ambientCG: the whole catalogue (PBR materials, HDRIs, a few models), paged. */
export async function collectAmbientcg(): Promise<CatalogEntry[]> {
  const out: CatalogEntry[] = [];
  const kindOf = (t: string) => (t === 'HDRI' ? 'hdri' : t === '3DModel' ? 'model' : 'texture');
  for (let offset = 0; ; offset += 250) {
    const r = await getJson<any>(
      `https://ambientcg.com/api/v2/full_json?limit=250&offset=${offset}&include=displayData,tagData,imageData`,
    );
    for (const a of r.foundAssets ?? [])
      out.push({
        source: 'ambientcg',
        id: a.assetId,
        name: a.displayName ?? a.assetId,
        kind: kindOf(a.dataType),
        license: 'CC0',
        url: `https://ambientcg.com/view?id=${a.assetId}`,
        tags: tagsOf(a.tags, a.displayCategory, a.dataType),
        cats: tagsOf(a.displayCategory),
        thumbUrl: a.previewImage?.['256-PNG'],
        fetch: `npm run assets:fetch -- ambientcg ${a.assetId}`,
      });
    if (!r.foundAssets?.length || offset + 250 >= r.numberOfResults) break;
  }
  return out;
}

const MODEL_EXT = /\.(glb|gltf|fbx|obj)$/i;
const IMG_EXT = ['.png', '.jpg', '.webp'];

/** Already-downloaded assets and unzipped packs (Kenney, Quaternius, KayKit) in assets/library/. */
export function collectLibrary(): CatalogEntry[] {
  if (!fs.existsSync(LIBRARY)) return [];
  const files = walk(LIBRARY);
  const images = new Map<string, string>();
  for (const f of files)
    if (IMG_EXT.includes(path.extname(f).toLowerCase())) images.set(path.basename(f, path.extname(f)).toLowerCase(), f);
  // Prefer glb > gltf > fbx > obj when a pack ships the same model in several formats.
  const best = new Map<string, string>();
  const rank = (f: string) => ['.glb', '.gltf', '.fbx', '.obj'].indexOf(path.extname(f).toLowerCase());
  for (const f of files.filter((x) => MODEL_EXT.test(x))) {
    const rel = path.relative(LIBRARY, f).split(path.sep);
    const k = `${rel[0]}/${rel[1]}/${path.basename(f, path.extname(f)).toLowerCase()}`;
    const prev = best.get(k);
    if (!prev || rank(f) < rank(prev)) best.set(k, f);
  }
  return [...best.values()].map((f) => {
    const rel = path.relative(LIBRARY, f).split(path.sep);
    const base = path.basename(f, path.extname(f));
    const meta = readMeta(path.join(LIBRARY, rel[0], rel[1]));
    const img = images.get(base.toLowerCase());
    return {
      source: 'local',
      id: rel.join('/'),
      name: base.replace(/[_-]+/g, ' '),
      kind: 'model',
      license: meta?.license ?? (['kenney', 'quaternius', 'kaykit'].includes(rel[0]) ? 'CC0' : 'CHECK'),
      author: meta?.author ?? rel[0],
      url: meta?.url ?? '',
      tags: tagsOf(rel.slice(0, -1), base.split(/[_\-\s]+/)),
      cats: tagsOf(rel[1]),
      thumbUrl: img ? new URL('file:///' + img.replace(/\\/g, '/')).href : undefined,
      fetch: path.relative(path.dirname(LIBRARY), f).replace(/\\/g, '/'),
    };
  });
}

function readMeta(dir: string): any {
  const p = path.join(dir, 'meta.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : undefined;
}
