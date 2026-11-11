// npm run assets:use -- <path under assets/library> [--as name] [--size px] [--keep-nodes]   (glb/gltf, obj+mtl, hdr/exr or images)
// Optimises a library asset into public/assets/ (committed) and records its credit.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { LIBRARY, PUBLIC, ROOT, parseArgs, walk, type AssetMeta } from './lib';

const { pos, flags } = parseArgs();
if (!pos[0]) {
  console.error('Usage: npm run assets:use -- <path under assets/library> [--as name]');
  process.exit(1);
}
const input = path.resolve(LIBRARY, pos[0]);
if (!fs.existsSync(input)) throw new Error(`Not found: ${input}`);

const files = fs.statSync(input).isDirectory() ? walk(input) : [input];
let model = files.find((f) => /\.(glb|gltf)$/i.test(f));
const obj = files.find((f) => /\.obj$/i.test(f));
if (!model && obj) {
  // ambientCG and many packs ship OBJ + MTL: convert to a binary glTF next to it first.
  model = obj.replace(/\.obj$/i, '.glb');
  const cli = path.join(ROOT, 'node_modules/obj2gltf/bin/obj2gltf.js');
  execFileSync(process.execPath, [cli, '-i', obj, '-o', model, '--binary'], { stdio: 'inherit' });
}
const hdri = files.find((f) => /\.(hdr|exr)$/i.test(f));
const images = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const name = flags.as ?? path.basename(fs.statSync(input).isDirectory() ? input : path.dirname(input));

const outputs: string[] = [];
if (model) {
  const out = path.join(PUBLIC, 'models', `${name}.glb`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const cli = path.join(ROOT, 'node_modules/@gltf-transform/cli/bin/cli.js');
  execFileSync(
    process.execPath,
    [
      cli,
      'optimize',
      model,
      out,
      '--compress',
      'meshopt',
      '--texture-compress',
      'webp',
      '--texture-size',
      flags.size ?? '1024',
      // --keep-nodes: keep every node and mesh apart (a pack merged into one file, picked apart by name in code).
      ...(flags['keep-nodes']
        ? ['--join', 'false', '--flatten', 'false', '--instance', 'false', '--palette', 'false', '--simplify', 'false']
        : []),
    ],
    { stdio: 'inherit' },
  );
  outputs.push(out);
} else if (hdri) {
  const out = path.join(PUBLIC, 'env', `${name}${path.extname(hdri)}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.copyFileSync(hdri, out);
  outputs.push(out);
} else if (images.length) {
  const dir = path.join(PUBLIC, 'textures', name);
  fs.mkdirSync(dir, { recursive: true });
  for (const img of images) {
    const out = path.join(dir, path.basename(img));
    fs.copyFileSync(img, out);
    outputs.push(out);
  }
} else throw new Error('No model, HDRI or image found in that path.');

// Credit
let metaDir = fs.statSync(input).isDirectory() ? input : path.dirname(input);
while (!fs.existsSync(path.join(metaDir, 'meta.json')) && metaDir.startsWith(LIBRARY)) metaDir = path.dirname(metaDir);
const metaFile = path.join(metaDir, 'meta.json');
const meta: Partial<AssetMeta> = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
const credits = path.join(PUBLIC, 'CREDITS.md');
if (!fs.existsSync(credits))
  fs.writeFileSync(credits, '# Asset credits\n\n| Asset | File | Source | Author | License |\n|---|---|---|---|---|\n');
for (const o of outputs) {
  const rel = path.relative(PUBLIC, o).split(path.sep).join('/');
  fs.appendFileSync(
    credits,
    `| ${meta.name ?? name} | ${rel} | ${meta.url ?? '?'} | ${meta.author ?? '?'} | ${meta.license ?? 'CHECK'} |\n`,
  );
  console.log(`✓ ${path.relative(ROOT, o)}`);
}
if (!meta.license || meta.license === 'CHECK') console.warn('⚠ License unknown: fill it in public/assets/CREDITS.md');
