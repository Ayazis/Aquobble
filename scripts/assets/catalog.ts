// npm run assets:catalog [-- --sources polyhaven,ambientcg,polypizza,sketchfab,local] [--terms "house,boat"] [--pages 2] [--no-thumbs]
// Builds/refreshes the local preview catalog in assets/catalog/ (gitignored): catalog.json, thumbs/, index.html.
// Re-running merges into the existing catalog and only downloads missing thumbnails.
import type { CatalogEntry } from './catalogLib';
import { CATALOG_DIR, downloadThumbs, loadCatalog, merge, saveCatalog } from './catalogLib';
import {
  SEED_TERMS,
  collectAmbientcg,
  collectLibrary,
  collectPolyhaven,
  collectPolypizza,
  collectSketchfab,
} from './catalogSources';
import { writeGallery } from './gallery';
import { parseArgs } from './lib';

const { flags } = parseArgs();
const wanted = (flags.sources ?? 'polyhaven,ambientcg,polypizza,sketchfab,local').split(',');
const terms = flags.terms ? flags.terms.split(',').map((t) => t.trim()) : SEED_TERMS;
const pages = Number(flags.pages ?? 2);

const collectors: Record<string, () => Promise<CatalogEntry[]> | CatalogEntry[]> = {
  polyhaven: collectPolyhaven,
  ambientcg: collectAmbientcg,
  polypizza: () => collectPolypizza(terms, pages),
  sketchfab: () => collectSketchfab(terms, Math.max(1, pages - 1)),
  local: collectLibrary,
};

let entries = loadCatalog();
console.log(`Catalog has ${entries.length} entries. Crawling ${wanted.join(', ')} (${terms.length} terms)…`);
for (const name of wanted) {
  const collect = collectors[name];
  if (!collect) {
    console.warn(`! unknown source "${name}", skipped`);
    continue;
  }
  try {
    const found = await collect();
    entries = merge(entries, found);
    console.log(`✓ ${name}: ${found.length} hits (catalog now ${entries.length})`);
    saveCatalog(entries); // save as we go, so an interrupted crawl keeps what it has
  } catch (err) {
    console.warn(`! ${name} skipped: ${(err as Error).message.split('\n')[0]}`);
  }
}

if (flags['no-thumbs'] !== 'true') await downloadThumbs(entries);
saveCatalog(entries);
writeGallery(entries);
console.log(`Done: ${entries.length} entries in ${CATALOG_DIR}. Open assets/catalog/index.html to browse.`);
