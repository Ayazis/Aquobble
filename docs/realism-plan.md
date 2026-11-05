# Realism pass: plan

Goal: make the island look as real as possible in a short session (~20 min), within the low-poly style.
The biggest wins come from lighting, ground cover and water, not from detailed models.

Branch: `feat/next-2`

## Phase 1: low-hanging fruit (do first)

### 1. Grass

- New `src/grass/` slice (add to `SLICES` in `slices.config.ts`).
- Instanced blade mesh, one draw call, placed on the terrain with a seeded `Random`.
- Skip water (height below `waterLevel`), steep slopes and the town (reuse `ExclusionZone` from `@vegetation`).
- Wind sway in the vertex shader.
- Config: count, extent, min/max height in `GameConfig`.

### 2. Flowers

- Same instancing approach as grass, a few colour variants, placed in seeded clusters.
- Lives in the grass slice (`FlowerInstancesFactory`).

### 3. Lighting and atmosphere

- `RenderContext`: raise `toneMappingExposure` (0.5 is dull); tune shadow bias and camera frustum.
- `PostProcessing`: add an ambient-occlusion pass (`GTAOPass` or `SAOPass`) before bloom.
- `EnvironmentConfig`: warmer, slightly denser fog for depth.

### 4. Water

- `WaterMeshFactory`: switch to three.js `Water` (reflections, moving normals).
- Water normal map via `npm run assets:fetch`, credited in `public/assets/CREDITS.md`.

### 5. Scattered rocks

- Place static rocks as decoration around the island (seeded), separate from the falling-rocks demo.

## Phase 2: more effort, still doable

### 6. Terrain textures

- CC0 grass/rock/sand textures via the `asset-sourcing` skill.
- Blend in `TerrainMeshFactory` by height and slope (shader patch on the standard material).

### 7. Pools and ponds

- Carve a few hollows into the `HeightField` (similar to `FlattenRegion`), each with its own water surface.

### 8. More buildings

- More model variants for `TownPlanner` plots, via `asset-sourcing`.

### 9. Accurate hitboxes

- Add a `trimesh` / `convexHull` variant to `ColliderShape` in `@physics`, implemented in `RapierPhysicsEngine`.
- Use it in `ModelPlotSpawner` instead of cuboids. Mostly noticeable up close.

## Later (out of scope for this session)

- Townsfolk reusing the player model and animations, with simple wandering.
- Day/night cycle, birds, ambient sound.

## Done when

- `npm run check` passes (lint, format, tests, build).
- Checked in the dev server (`npm run dev`) and FPS is still acceptable (`@diagnostics` overlay).
- New assets are listed in `public/assets/CREDITS.md`.
