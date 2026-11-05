// Writes assets/catalog/index.html: an offline, filterable thumbnail grid over catalog.json.
import fs from 'node:fs';
import path from 'node:path';
import type { CatalogEntry } from './catalogLib';
import { CATALOG_DIR } from './catalogLib';

export function writeGallery(entries: CatalogEntry[]) {
  const data = JSON.stringify(
    entries.map((e) => ({
      s: e.source,
      n: e.name,
      k: e.kind,
      l: e.license,
      a: e.author ?? '',
      u: e.url,
      t: e.tags.join(' '),
      tr: e.tris ?? null,
      an: !!e.animated,
      th: e.thumb ?? '',
      f: e.fetch,
    })),
  ).replace(/</g, '\\u003c');
  fs.writeFileSync(path.join(CATALOG_DIR, 'index.html'), HTML.replace('__DATA__', data));
}

const HTML = `<!doctype html><meta charset="utf-8"><title>Asset catalog</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#f6f6f4;--card:#fff;--fg:#222;--mut:#777;--bd:#ddd;--acc:#2a7}
@media (prefers-color-scheme:dark){:root{--bg:#18191b;--card:#222326;--fg:#eee;--mut:#999;--bd:#333;--acc:#4c9}}
body{margin:0;font:14px system-ui,sans-serif;background:var(--bg);color:var(--fg)}
header{position:sticky;top:0;background:var(--bg);padding:12px 16px;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--bd);z-index:1}
input,select{font:inherit;padding:6px 8px;border:1px solid var(--bd);border-radius:6px;background:var(--card);color:var(--fg)}
#q{flex:1;min-width:180px}#count{color:var(--mut);align-self:center}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;padding:16px}
.c{background:var(--card);border:1px solid var(--bd);border-radius:8px;overflow:hidden;cursor:pointer}
.c img{width:100%;aspect-ratio:1;object-fit:cover;background:#8882;display:block}
.c div{padding:6px 8px}.n{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m{color:var(--mut);font-size:12px}.cc0{color:var(--acc)}
</style>
<header><input id="q" placeholder="Search name, tag, author… (e.g. house cc0)" autofocus>
<select id="src"><option value="">all sources</option></select>
<select id="lic"><option value="">any license</option><option value="cc0">CC0 only</option><option value="by">CC-BY ok</option></select>
<select id="tri"><option value="">any tris</option><option>1000</option><option>5000</option><option>20000</option></select>
<span id="count"></span></header><main id="g"></main>
<script>
const D=__DATA__,$=id=>document.getElementById(id);
[...new Set(D.map(d=>d.s))].sort().forEach(s=>$('src').add(new Option(s,s)));
const ok=(d,ws,src,lic,tri)=>{const h=(d.n+' '+d.t+' '+d.a+' '+d.k+' '+d.s+' '+d.l).toLowerCase();
 if(src&&d.s!==src)return false;const L=d.l.toLowerCase();
 if(lic==='cc0'&&!/cc0|public/.test(L))return false;if(lic==='by'&&!/cc0|public|by/.test(L)||lic==='by'&&/nc|nd/.test(L))return false;
 if(tri&&d.tr!=null&&d.tr>+tri)return false;return ws.every(w=>h.includes(w))};
function render(){const ws=$('q').value.toLowerCase().split(/\\s+/).filter(Boolean),src=$('src').value,lic=$('lic').value,tri=$('tri').value;
 const r=D.filter(d=>ok(d,ws,src,lic,tri));$('count').textContent=r.length+' / '+D.length;
 $('g').innerHTML=r.slice(0,600).map((d,i)=>'<div class="c" data-i="'+D.indexOf(d)+'"><img loading="lazy" src="'+(d.th||'')+'" alt=""><div><div class="n" title="'+esc(d.n)+'">'+esc(d.n)+'</div><div class="m"><span class="'+(/cc0/i.test(d.l)?'cc0':'')+'">'+esc(d.l)+'</span> · '+esc(d.s)+(d.tr?' · '+d.tr+' tris':'')+(d.an?' · anim':'')+'</div><div class="m">'+esc(d.a)+'</div></div></div>').join('')}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('g').onclick=e=>{const c=e.target.closest('.c');if(!c)return;const d=D[c.dataset.i];
 navigator.clipboard?.writeText(d.f).catch(()=>{});if(d.u&&e.ctrlKey)open(d.u);else alert(d.n+'\\n'+d.l+' · '+d.a+'\\n'+d.u+'\\n\\nCopied: '+d.f+'\\n(Ctrl+click opens the source page)')};
['q','src','lic','tri'].forEach(id=>$(id).addEventListener('input',render));render();
</script>`;
