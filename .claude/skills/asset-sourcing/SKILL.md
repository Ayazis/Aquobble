---
name: asset-sourcing
description: Use whenever the user asks for a new game asset (a model like a house, plane, boat, animal, prop; or a texture, HDRI or sky). Walks the user through free asset sources first, presents options to choose from, and only falls back to a code-built low-poly placeholder. Never model or generate an asset in Blender unless the user explicitly picks that.
---

# Asset sourcing

Goal: get the right asset with the least effort and a clean license. **Do not start building or
generating the asset** (Blender modelling, `generate_3d`, hand-written geometry) just because you can.
The user decides; your job is to show them the options.

## 1. Clarify (only what's missing)

Ask briefly if unclear: what it is, rough style (low-poly to match Aquobble), static or animated,
and its role (hero object vs background filler). Skip questions with obvious answers.

## 2. Search free sources first

Use the repo tooling (see README "Assets"). One command searches local packs and every online source,
drops NC/ND licenses, and ranks local first, then CC0:

```bash
npm run assets:search -- all <query> [--license cc0] [--max-tris 5000]
```

Narrow to one source when needed (`polypizza`, `sketchfab`, `polyhaven --type models|textures|hdris`,
`ambientcg`). A source with a missing key is skipped with a warning; mention it to the user.

The local preview catalog (`assets/catalog/`, gitignored) holds thousands of entries with thumbnails.
Point the user at `assets/catalog/index.html` to browse them visually, and refresh it with
`npm run assets:catalog` (add `--terms "x,y"` to crawl new subjects).

Also check the packs without an API (browse their sites, or what's already in `assets/library/`):
Kenney (kenney.nl), Quaternius (quaternius.com), KayKit (kaylousberg.itch.io). These are CC0 and
match the low-poly style well. Mention the pack name and URL; the user downloads them.

The Blender MCP `search_assets` covers the same libraries and is fine as a lookup, but don't import
into Blender unless the user wants to edit the model there.

## 3. Present options and stop

Show a short table of the 3-5 best candidates, then **wait for the user's pick**:

| # | Name | Source | License | Poly count / style | Link |

Rules:

- Prefer CC0; flag CC-BY (needs credit) and exclude anything non-commercial or no-derivatives.
- Note missing keys (`SKETCHFAB_API_TOKEN`, `POLYPIZZA_API_KEY` in `.env`) instead of failing silently.
- Mention style mismatches (realistic vs low-poly, too many polys for the web).

## 4. Bring in the chosen asset

```bash
npm run assets:fetch -- <source> <id>
npm run assets:use -- <source>/<id> --as <snake_case_name>
```

`assets:use` optimises into `public/assets/` and adds the credit line in `public/assets/CREDITS.md`;
verify that line exists. Raw files stay in gitignored `assets/library/`.

## 5. Nothing suitable? Suggest a placeholder

If no candidate fits, say so and **propose** (don't just build) a low-poly placeholder:

- Built in code from three.js primitives (boxes, cones, cylinders) with flat-colour materials, in a
  `Factory` in the relevant slice, roughly the right size and silhouette.
- Clearly named as temporary (e.g. `PlaceholderHouseFactory`) with a `// TODO: replace with real asset`
  so it's easy to swap out later.
- Its loading/spawning goes through the same spawner a real glTF would use, so the swap only touches the factory.

Offer the alternatives too, and let the user choose:

1. Placeholder now, real asset later (default recommendation).
2. User supplies an asset (any `.glb`/`.gltf`/zip; drop it in `assets/library/` and run `assets:use`).
3. Model it in Blender via MCP, or `generate_3d` (slow; may cost credits). Only on explicit request.
