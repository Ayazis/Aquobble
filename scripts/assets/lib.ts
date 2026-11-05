import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const ROOT = path.resolve(import.meta.dirname, '../..');
/** Raw downloads: gitignored. */
export const LIBRARY = path.join(ROOT, 'assets/library');
/** Optimised, used assets: committed and served by Vite. */
export const PUBLIC = path.join(ROOT, 'public/assets');

export const UA = 'Aquobble-asset-scripts/0.1 (github.com/Ayazis/Aquobble)';

export interface AssetMeta {
  source: string;
  id: string;
  name: string;
  license: string;
  author?: string;
  url: string;
  files: string[];
}

export async function getJson<T = any>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}\n${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function download(url: string, dest: string, headers: Record<string, string> = {}) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`  ↓ ${path.relative(ROOT, dest)}`);
  return dest;
}

/** Extract a zip next to itself (Windows 10+ and macOS/Linux ship bsdtar/tar that reads zip). */
export function unzip(zip: string, dir = path.dirname(zip)) {
  fs.mkdirSync(dir, { recursive: true });
  // On Windows use the built-in bsdtar; Git Bash's GNU tar treats "E:" as a remote host.
  const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
  execFileSync(tar,['-xf', zip, '-C', dir], { stdio: 'inherit' });
  fs.rmSync(zip);
}

export function assetDir(source: string, id: string) {
  return path.join(LIBRARY, source, id.replace(/[^\w.-]+/g, '_'));
}

export function writeMeta(dir: string, meta: AssetMeta) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log(`✓ ${meta.source}/${meta.id} → ${path.relative(ROOT, dir)} (${meta.license})`);
}

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set. Add it to .env (see .env.example).`);
  return v;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const pos: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      flags[k] = v ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true');
    } else pos.push(a);
  }
  return { pos, flags };
}

export function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
}
