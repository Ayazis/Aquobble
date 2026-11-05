import path from 'node:path';
import { assetDir, download, env, getJson, unzip, walk, writeMeta } from './lib';

export interface SearchHit {
  id: string;
  name: string;
  kind: string;
  license: string;
  author?: string;
}

export interface Source {
  search(query: string, flags: Record<string, string>): Promise<SearchHit[]>;
  fetch(id: string, flags: Record<string, string>): Promise<void>;
}

const match = (q: string, ...fields: (string | string[] | undefined)[]) => {
  const hay = fields.flat().join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w));
};

// ─── Poly Haven ── https://polyhaven.com · CC0 · no key ─────────────────────
const polyhaven: Source = {
  async search(q, flags) {
    const type = flags.type ?? 'all'; // hdris | textures | models | all
    const all = await getJson<Record<string, any>>(`https://api.polyhaven.com/assets?type=${type}`);
    const kinds = ['hdri', 'texture', 'model'];
    return Object.entries(all)
      .filter(([id, a]) => match(q, id, a.name, a.tags, a.categories))
      .map(([id, a]) => ({
        id,
        name: a.name,
        kind: kinds[a.type],
        license: 'CC0',
        author: Object.keys(a.authors ?? {}).join(', '),
      }));
  },
  async fetch(id, flags) {
    const res = flags.res ?? '2k';
    const info = await getJson<any>(`https://api.polyhaven.com/info/${id}`);
    const files = await getJson<any>(`https://api.polyhaven.com/files/${id}`);
    const dir = assetDir('polyhaven', id);
    const got: string[] = [];
    if (files.hdri) {
      const fmt = flags.format ?? 'hdr';
      const f = files.hdri[res]?.[fmt];
      if (!f) throw new Error(`No ${res}/${fmt}. Available: ${Object.keys(files.hdri).join(', ')}`);
      got.push(await download(f.url, path.join(dir, `${id}_${res}.${fmt}`)));
    } else {
      // textures and models: grab the glTF bundle (gltf + bin + textures)
      const g = files.gltf?.[res]?.gltf;
      if (!g) throw new Error(`No ${res} glTF. Available: ${Object.keys(files.gltf ?? {}).join(', ')}`);
      got.push(await download(g.url, path.join(dir, path.basename(new URL(g.url).pathname))));
      for (const [rel, inc] of Object.entries<any>(g.include ?? {}))
        got.push(await download(inc.url, path.join(dir, rel)));
    }
    writeMeta(dir, {
      source: 'polyhaven',
      id,
      name: info.name,
      license: 'CC0',
      author: Object.keys(info.authors ?? {}).join(', '),
      url: `https://polyhaven.com/a/${id}`,
      files: got.map((f) => path.relative(dir, f)),
    });
  },
};

// ─── ambientCG ── https://ambientcg.com · CC0 · no key ──────────────────────
const ambientcg: Source = {
  async search(q, flags) {
    const type = flags.type ? `&type=${flags.type}` : ''; // Material | HDRI | 3DModel ...
    const r = await getJson<any>(`https://ambientcg.com/api/v2/full_json?q=${encodeURIComponent(q)}&limit=50${type}`);
    return r.foundAssets.map((a: any) => ({
      id: a.assetId,
      name: a.displayName ?? a.assetId,
      kind: a.dataType,
      license: 'CC0',
    }));
  },
  async fetch(id, flags) {
    const attr = flags.res ?? '2K-JPG';
    const r = await getJson<any>(`https://ambientcg.com/api/v2/full_json?id=${id}&include=downloadData`);
    const a = r.foundAssets[0];
    if (!a) throw new Error(`ambientCG asset ${id} not found`);
    const downloads = Object.values<any>(a.downloadFolders ?? {}).flatMap((f) =>
      Object.values<any>(f.downloadFiletypeCategories ?? {}).flatMap((c) => c.downloads ?? []),
    );
    const d = downloads.find((x) => x.attribute === attr);
    if (!d) throw new Error(`No ${attr}. Available: ${downloads.map((x) => x.attribute).join(', ')}`);
    const dir = assetDir('ambientcg', id);
    const zip = await download(d.downloadLink, path.join(dir, d.fileName));
    if (zip.endsWith('.zip')) unzip(zip);
    writeMeta(dir, {
      source: 'ambientcg',
      id,
      name: a.displayName ?? id,
      license: 'CC0',
      url: `https://ambientcg.com/view?id=${id}`,
      files: walk(dir)
        .map((f) => path.relative(dir, f))
        .filter((f) => f !== 'meta.json'),
    });
  },
};

// ─── Poly Pizza ── https://poly.pizza · CC0 / CC-BY · needs POLYPIZZA_API_KEY ─
const polypizza: Source = {
  async search(q) {
    const r = await getJson<any>(`https://api.poly.pizza/v1.1/search/${encodeURIComponent(q)}`, {
      'x-auth-token': env('POLYPIZZA_API_KEY'),
    });
    return (r.results ?? []).map((m: any) => ({
      id: m.ID,
      name: m.Title,
      kind: 'model',
      license: m.Licence ?? m.License ?? '?',
      author: m.Creator?.Username,
    }));
  },
  async fetch(id) {
    const m = await getJson<any>(`https://api.poly.pizza/v1.1/model/${id}`, {
      'x-auth-token': env('POLYPIZZA_API_KEY'),
    });
    const dir = assetDir('polypizza', id);
    const file = await download(m.Download, path.join(dir, `${id}.glb`));
    writeMeta(dir, {
      source: 'polypizza',
      id,
      name: m.Title,
      license: m.Licence ?? m.License ?? '?',
      author: m.Creator?.Username,
      url: `https://poly.pizza/m/${id}`,
      files: [path.basename(file)],
    });
  },
};

// ─── Sketchfab ── https://sketchfab.com · mixed licenses · download needs SKETCHFAB_API_TOKEN
const sketchfab: Source = {
  async search(q, flags) {
    const lic = flags.license ? `&license=${flags.license}` : ''; // e.g. cc0, by
    const r = await getJson<any>(
      `https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=24&q=${encodeURIComponent(q)}${lic}`,
    );
    return r.results.map((m: any) => ({
      id: m.uid,
      name: m.name,
      kind: `model ${m.faceCount ?? '?'}f`,
      license: m.license?.label ?? '?',
      author: m.user?.username,
    }));
  },
  async fetch(id) {
    const auth = { Authorization: `Token ${env('SKETCHFAB_API_TOKEN')}` };
    const m = await getJson<any>(`https://api.sketchfab.com/v3/models/${id}`);
    const d = await getJson<any>(`https://api.sketchfab.com/v3/models/${id}/download`, auth);
    const dir = assetDir('sketchfab', id);
    if (d.glb) await download(d.glb.url, path.join(dir, `${id}.glb`));
    else unzip(await download(d.gltf.url, path.join(dir, `${id}.zip`)));
    writeMeta(dir, {
      source: 'sketchfab',
      id,
      name: m.name,
      license: m.license?.label ?? '?',
      author: m.user?.username,
      url: m.viewerUrl,
      files: walk(dir).map((f) => path.relative(dir, f)),
    });
  },
};

// ─── Any direct URL (Kenney / Quaternius / KayKit zips you copied a link for) ─
const url: Source = {
  async search() {
    throw new Error('The url source has no search; browse kenney.nl, quaternius.com or kaylousberg.itch.io.');
  },
  async fetch(u, flags) {
    const name = flags.name ?? path.basename(new URL(u).pathname).replace(/\.zip$/i, '');
    const dir = assetDir(flags.source ?? 'manual', name);
    const file = await download(u, path.join(dir, path.basename(new URL(u).pathname)));
    if (file.toLowerCase().endsWith('.zip')) unzip(file);
    writeMeta(dir, {
      source: flags.source ?? 'manual',
      id: name,
      name,
      license: flags.license ?? 'CHECK',
      author: flags.author,
      url: u,
      files: walk(dir).map((f) => path.relative(dir, f)),
    });
  },
};

export const sources: Record<string, Source> = { polyhaven, ambientcg, polypizza, sketchfab, url };

export function sourceOrDie(name: string | undefined): Source {
  const s = name && sources[name];
  if (!s) {
    console.error(`Unknown source "${name}". Use one of: ${Object.keys(sources).join(', ')}`);
    process.exit(1);
  }
  return s;
}
