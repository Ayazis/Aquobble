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

`water/waterRefractionChunk.ts`, desktop only (`RenderQuality.refraction`):

- Looking through: the opaque scene behind the surface, losing red first and green second with every metre of
  water crossed.
- Mirroring: a 22-step march through the scene depth along the reflected ray; where it lands on the island
  that colour replaces the sky reflection.
- The sun's glitter is the material's own highlight on three layers of scrolling ripples, widening with
  distance.

## Checking a change

`npm run shots` for the whole game, `lookdev.html` for the sky and lighting alone (see the README).
