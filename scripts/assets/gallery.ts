// Writes assets/catalog/index.html: an offline, filterable thumbnail grid over catalog.json.
import fs from 'node:fs';
import path from 'node:path';
import type { CatalogEntry } from './catalogLib';
import { CATALOG_DIR } from './catalogLib';
import { groupOf } from './categories';

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
      c: [groupOf(e)],
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
#types{display:flex;gap:4px;flex-wrap:wrap;width:100%}#types button{font:inherit;padding:6px 12px;border:1px solid var(--bd);border-radius:999px;background:var(--card);color:var(--fg);cursor:pointer}#types button.on{background:var(--acc);border-color:var(--acc);color:#fff}#types small{opacity:.7}label{align-self:center;color:var(--mut)}
</style>
<header><nav id="types"></nav>
<input id="q" placeholder="Search name, tag, author… (e.g. wooden boat)" autofocus>
<select id="cat"></select>
<select id="src"><option value="">all sources</option></select>
<select id="lic"><option value="">any license</option><option value="cc0">CC0 only</option><option value="by">CC0 + CC-BY</option></select>
<select id="tri"><option value="">any tris</option><option value="1000">≤ 1k tris</option><option value="5000">≤ 5k tris</option><option value="20000">≤ 20k tris</option></select>
<label><input type="checkbox" id="anim"> animated</label>
<span id="count"></span></header><main id="g"></main>
<script>
const D=__DATA__,$=id=>document.getElementById(id);D.forEach((d,i)=>d.i=i);
const TYPES=[['','All'],['model','3D models'],['texture','Textures & materials'],['hdri','HDRIs & skies']];
let type='';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function tabs(){$('types').innerHTML=TYPES.map(([k,l])=>'<button data-k="'+k+'" class="'+(k===type?'on':'')+'">'+l+' <small>'+D.filter(d=>!k||d.k===k).length+'</small></button>').join('')}
function cats(){const n={};D.filter(d=>!type||d.k===type).forEach(d=>d.c.forEach(c=>n[c]=(n[c]||0)+1));const prev=$('cat').value;
 $('cat').innerHTML='<option value="">all categories</option>'+Object.entries(n).sort((a,b)=>a[0].localeCompare(b[0])).map(([c,k])=>'<option value="'+esc(c)+'">'+esc(c)+' ('+k+')</option>').join('');
 if(n[prev])$('cat').value=prev}
[...new Set(D.map(d=>d.s))].sort().forEach(s=>$('src').add(new Option(s,s)));
const ok=(d,f)=>{if(type&&d.k!==type)return false;if(f.cat&&!d.c.includes(f.cat))return false;if(f.src&&d.s!==f.src)return false;
 const L=d.l.toLowerCase();if(f.lic==='cc0'&&!/cc0|public/.test(L))return false;
 if(f.lic==='by'&&(!/cc0|public|by/.test(L)||/nc|nd/.test(L)))return false;
 if(f.tri&&d.tr!=null&&d.tr>+f.tri)return false;if(f.anim&&!d.an)return false;
 const h=(d.n+' '+d.t+' '+d.a+' '+d.s+' '+d.c.join(' ')).toLowerCase();return f.ws.every(w=>h.includes(w))};
function render(){const f={ws:$('q').value.toLowerCase().split(/\\s+/).filter(Boolean),cat:$('cat').value,src:$('src').value,lic:$('lic').value,tri:$('tri').value,anim:$('anim').checked};
 const r=D.filter(d=>ok(d,f));$('count').textContent=r.length+' / '+D.length+(r.length>600?' (first 600 shown)':'');
 $('g').innerHTML=r.slice(0,600).map(d=>'<div class="c" data-i="'+d.i+'"><img loading="lazy" src="'+(d.th||'')+'" alt=""><div><div class="n" title="'+esc(d.n)+'">'+esc(d.n)+'</div><div class="m"><span class="'+(/cc0/i.test(d.l)?'cc0':'')+'">'+esc(d.l)+'</span> · '+esc(d.s)+(d.tr?' · '+d.tr+' tris':'')+(d.an?' · anim':'')+'</div><div class="m">'+esc([d.k].concat(d.c).join(' · '))+'</div></div></div>').join('')}
$('types').onclick=e=>{const b=e.target.closest('button');if(!b)return;type=b.dataset.k;tabs();cats();render()};
$('g').onclick=e=>{const c=e.target.closest('.c');if(!c)return;const d=D[c.dataset.i];
 navigator.clipboard?.writeText(d.f).catch(()=>{});if(d.u&&e.ctrlKey)open(d.u);else alert(d.n+'\\n'+d.l+' · '+d.a+'\\n'+d.u+'\\n\\nCopied: '+d.f+'\\n(Ctrl+click opens the source page)')};
['q','cat','src','lic','tri','anim'].forEach(id=>$(id).addEventListener('input',render));tabs();cats();render();
</script>`;
