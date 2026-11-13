# Rendering

The island is drawn with physically based lighting. The earlier plans in this folder (`graphics-plan.md`,
`polish-plan.md`, `colour-script.md`) describe the cel-shaded look that came before; where they disagree with
this page, this page is current.

## One atmosphere

`environment/Atmosphere.ts` is an analytic daylight model (Preetham, as in three.js's `Sky`). Everything
that depends on the sun reads from it, so nothing can disagree:

| What                 | Where                                                           |
| -------------------- | --------------------------------------------------------------- |
| Sky colour per pixel | `atmosphereGlsl.ts` (`skyScatter`), drawn by `skyDomeShader.ts` |
| Sun colour, strength | `Atmosphere.sunColour` → the directional light                  |
| Fog colour           | `skyLighting.ts`: the horizon to either side of the sun         |
| Ambient light        | the sky dome baked into an environment map (`SkyDome`)          |
| Bounce light         | hemisphere fill, ground side only (`skyLighting.bounce`)        |

`skyLighting(atmosphere, sun, overcast)` turns a sun direction into all of these. The night is not physical:
moonlight, the night sky gradient and the blue fill are painted from `COLOUR_SCRIPT.night`. `DayKeyframe` now
holds only art direction (fog density, grade, intensity multipliers), no colours.

A low sun lights the island a small fraction as brightly as noon, so the exposure adapts
(`adaptedExposure.ts`), most of the way, leaving dusk moodier than midday.

## Clouds

Volumetric cumulus (`cloudVolumeGlsl.ts`): a slab whose footprint is the shared `CLOUD_PATTERN`, so the cloud
shadows on the ground (`cloudShadowChunk.ts`) lie under the clouds overhead. Marching a cloud per screen pixel
is too dear, so `CloudMap` marches them into a fisheye map of the sky, one band of the map per frame, each
redraw blended into the last with a different jitter. The cloud dome and the environment bake read the map.
`RenderQuality.sky` sets the map size and step count (phones: 512 and 10).

## Lighting

`installSceneLighting` patches the lighting shared by every standard material: the physical sun term dimmed by
cloud shadows, two shadow cascades, and street probes that shut sky light out of narrow streets. Tone mapping
is AgX; `ColorGradeShader` adds a filmic S-curve, saturation and a vignette. Ink outlines survive as a menu
option, off by default.

## Surfaces

- **Terrain**: smooth normals; grass, sand and rock layers with normal maps (rock triplanar); wet sand
  shines. Normal maps for these three were derived with `npm run assets:normals`.
- **Models**: `SurfaceDetailLibrary` lays detail textures over buildings, rocks and bark; their brightness
  doubles as height for relief (`DETAIL_RELIEF_MAIN`, no extra texture reads). Cobbles and road dirt use real
  normal maps.
- **Foliage**: leaf normals are bent outwards from the crown's centre (`roundNormals`), so a crown is lit as
  one rounded mass.

## Water

One `MeshStandardMaterial` patched by `water/shader/patchWaterShader.ts`, so the sea is lit, shadowed and fogged
by the same sun, sky and weather as the land. The chunks under `water/shader/` run in this order:

| Chunk      | What it works out                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| vertex     | the mesh rides the Gerstner swell, the surf and the swash; the tide lifts the sea                    |
| surface    | the normal: swell (all waves, per pixel), the surf's face, four layers of wind ripples, ripple rings |
| foam       | waterline and swash, breaking surf, whitecaps, stamped foam, collars round things in the water       |
| colour     | the water's own scattered colour; on phones the depth blend over the bed                             |
| refraction | the scene behind, bent and fringed, with caustics, then absorbed by the water crossed (desktop)      |
| reflection | a march through the scene depth along the mirrored ray, refined by halving (desktop)                 |
| glow       | sunlight through wave crests, ripple rims; water's 2% mirror; a cap on glints                        |

**Waves are shared with the simulation.** `gerstnerWavesFromWind` fans eight waves (26 m down to 2.2 m) round
the wind; `GerstnerWaveField` (CPU) and `gerstnerGlsl` (GPU) read the same terms. The mesh is moved only by
the waves its vertices can carry (`WAVE_MESH_COUNT`), the per-pixel normal uses them all and fades each one
out as it shrinks to a few pixels. `surf.ts` / `surfGlsl.ts` add the surf: its phase is the time a wave in
water that deep still needs to reach the shore (it travels at sqrt(g depth)), so crests follow the depth
contours, roll in towards every beach and bunch up as they slow. `ShoreWaveField` gives buoyancy and wading
the same heights. `SeaStateSystem` lets the swell, surf, whitecaps and ruffle follow the wind (`uWaterSwell`,
`uWaterWind`); the swell is lower over shallow water, so bays lie calmer than the open sea.

**Generated textures** (`water/detail/`, no downloads). `WaterDetailFactory` sums a wave spectrum with an
inverse FFT into a tiling patch of ripples (tilt in red and green, height in blue) and traces the light
those ripples focus on the bed into alpha (the caustic net). `FoamTextureFactory` makes bubble walls ordered
so that a rising threshold grows foam from torn lace to a solid sheet.

**Looking through** (`RenderQuality.refraction`): red goes first and green second with every metre of water
crossed, so sand shallows are turquoise and depths blue; ponds are murkier. Caustics land on whatever is
down there, where the sun's ray to it crossed the surface. The bed's position comes from a half-float
depth, too coarse for the GPU to pick a mip level from: the caustic lookups set theirs by hand.
`wetSandHook` keeps the bed under water matt and a little lighter than the wet beach.

`RenderQuality.water` sets the sea mesh (320 segments a side on desktop, an even 0.85 m grid over the island),
the detail map, the ripple simulation (512 texels over 40 m) and the finest ripple layer.

## Checking a change

`npm run shots` for the whole game, `lookdev.html` for the sky and lighting alone and `lookdev-water.html` for
the water alone (see the README).
