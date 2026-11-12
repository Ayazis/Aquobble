# Aquobble

Three.js web game: an island with a physically based sky, water and lighting (`docs/rendering.md`). Static
build, deployed to GitHub Pages on every push to `main`:
https://ayazis.github.io/Aquobble/

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
```

## Debug mode and reference screenshots

Open the game with `?debug` for an FPS, draw-call and triangle readout, and these keys: `[` and `]` step the
time of day, `\` stops the clock, `F` freezes the camera (then `I` `K` `J` `L` fly it, `U` and `O` lower and raise it).

```bash
npx playwright-core install chromium   # once
npm run shots -- before                # all views, times and devices → shots/before/ (gitignored)
npm run shots -- after --views plaza,lane --times noon --devices desktop
```

Each line of output gives the view's mean brightness and how much of it is blown-out white or crushed black.
Add `--software` on a machine without a GPU (slow); there `--fast` skips the FPS measurement and
`--grass low --shadows low` make each frame several times quicker. `--weather clear|overcast|rain|mist` holds
one weather state. Views live in `scripts/shots/views.ts`.

For the sky and lighting alone, `lookdev.html` (dev server only) runs the real render pipeline over a bare
ground with test spheres: `?t=0.72&yaw=-99&pitch=10&overcast=0` sets the time of day, view and cloud cover.
`npx tsx scripts/lookdev/shoot.ts <outDir> "t=0.5" "t=0.74&yaw=-106"` saves a screenshot per query.

## Assets

Raw downloads go to `assets/library/` (**gitignored**). Only assets that are actually used get optimised
into `public/assets/` (committed; the only place asset binaries may live in git, see `.gitignore`) and credited in `public/assets/CREDITS.md`.

| Source      | What                                                 | License          | Key                                |
| ----------- | ---------------------------------------------------- | ---------------- | ---------------------------------- |
| `polyhaven` | HDRI skies, textures, models                         | CC0              | none                               |
| `ambientcg` | PBR textures, HDRIs                                  | CC0              | none                               |
| `sketchfab` | models (downloadable only)                           | mixed: check!    | `SKETCHFAB_API_TOKEN` for download |
| `polypizza` | low-poly models                                      | CC0 / CC-BY      | `POLYPIZZA_API_KEY`                |
| `url`       | any direct zip/glb link (Kenney, Quaternius, KayKit) | pass `--license` | none                               |

Keys go in `.env` (copy `.env.example`).

```bash
# 1. find, local first: in-game (public/assets) → downloaded → cached catalog → online (--offline skips online)
npm run assets:search -- all sail boat --max-tris 5000
npm run assets:search -- polyhaven sky --type hdris
npm run assets:search -- ambientcg grass --type Material
npm run assets:search -- sketchfab low poly tree --license cc0

# 2. download into assets/library/<source>/<id>/ (with meta.json for licensing)
npm run assets:fetch -- polyhaven kloofendal_48d_partly_cloudy_puresky --res 1k
npm run assets:fetch -- ambientcg Grass004 --res 1K-JPG
npm run assets:fetch -- url https://example.com/pack.zip --source kenney --license CC0

# 3. use: optimise (glTF or OBJ → meshopt + webp) into public/assets/ and add a credit line
npm run assets:use -- sketchfab/<id> --as apple_tree
```

Textures whose source has no normal map can get one derived from their brightness:
`npm run assets:normals -- grass rock sand` writes `<name>-normal.webp` next to each.

Load optimised models with `GLTFLoader` + `MeshoptDecoder` (`three/addons/libs/meshopt_decoder.module.js`).

Kenney, Quaternius and KayKit have no API: download their packs in the browser
(kenney.nl, quaternius.com, kaylousberg.itch.io) and unzip them into `assets/library/<source>/<pack>/`.

### Local preview catalog

`npm run assets:catalog` crawls Poly Haven, ambientCG, Poly Pizza, Sketchfab (low-poly, CC0/CC-BY) and your unzipped
packs into `assets/catalog/` (**gitignored**): `catalog.json`, `thumbs/` and an offline `index.html` grid with type tabs (3D models / textures / HDRIs), categories (fabric, wood, furniture…)
with search and license/triangle filters. Clicking a card copies its `assets:fetch` command. Re-runs merge
and only download missing thumbnails; `--sources`, `--terms "a,b"` and `--pages n` narrow the crawl.

## Blender + MCP

`.mcp.json` registers [blender-mcp](https://github.com/ahujasid/blender-mcp) (`uvx blender-mcp`) so Claude can
drive Blender and pull Poly Haven / Sketchfab assets straight into a scene. One-time setup:

1. Blender → Edit → Preferences → Add-ons → ⌄ → _Install from Disk…_ → `tools/blender/blender_mcp_addon.py`, enable it.
2. In the 3D view press `N` → **BlenderMCP** tab → _Connect to Claude_.
3. Restart Claude Code in this folder and approve the `blender` MCP server.
