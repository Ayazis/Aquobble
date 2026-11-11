# Polish plan: graphics

Goal: raise the visual quality of the island (lighting, textures and ground, grass, stones, trees, water, sky)
without leaving the low-poly, cel-shaded look.

Sound is out of scope. Menus, movement and goals are parked; a short list is at the end.

## How this plan was made

From reading the rendering code and from running the build at `fe5c61a` in headless Chromium: about 25 views
of the town, meadow, forest, coast, a pond, rocks, trees and the sky, at mid-morning, noon, sunset and night,
plus one phone view.

That run used software rendering at 1x resolution and about 1 FPS. Colour, light and shape were seen on screen.
Antialiasing (1.2) and all frame-rate cost are read from the code and need a real device to confirm.

## The look to aim for

The two best frames in the game today are the plaza at sunset and a house front at mid-morning: crisp facets, two
clean bands of light, saturated mid-tone colour, and grain you only notice up close. Most of this plan is about
bringing the rest of the picture (the ground, rocks, trees, midday and night) up to those frames.

Rules for every change:

- Colour and light carry the detail. Shapes stay low-poly.
- In sunlight nothing reaches white except clouds, foam and the sun itself.
- Everything meets the ground convincingly: no hard line where a trunk, rock or wall stands on flat green.
- A phone and a desktop show the same picture at different sharpness, not two different pictures.

## What stands out today

1. **The sun whites out the screen.** Whenever the sun is in view by day, a white haze covers a third of the
   frame and spills over buildings and rocks in front of it (1.1).
2. **Pale surfaces bleach at midday.** The town wall, the cobbled square and the roads come out nearly white.
   The same surfaces look right at sunset (1.3).
3. **Night shadows are pure black.** Under trees the screen is black; the town has no lit lamps or windows
   (1.4, 1.5).
4. **The square and roads are blurry smears**, while cobblestone and dirt textures made for them sit unused in
   the repository (2.2).
5. **Terrain colours change in sawtooth triangles**, and steep faces stay grass-green (2.1).
6. **Every stone is a 20-triangle lump** and every tree is the same tree (4.1, 5.1).
7. **No grass inside the town**, and bare squares around the round ponds (3.1).

## Status

Done: the two tools below (0.1, 0.2), the decisions at the end, and the first pass of step 2: 1.1 (sun disc off,
bloom strength 0.06 and threshold 6; `lane` at noon went from 17.7% to 14.0% white and the haze is gone, but the
sun is now invisible, so our own controlled sun is still to do), 1.2 (4x multisampled scene buffer on desktop; phone
edge smoothing still to do), 1.4 in part (brighter blue night fill; the hour-driven grade is still to do), 1.3 in
part (sun 1.8, sky fill 1.25; the palest surface colours and the histogram are still to do) and 1.11 (phones now run
the grade as its own pass instead of folding it into the output step).

Step 3, first pass: 2.2 (square is `cobble`, roads are `dirt`, both with their normal maps; edges fray through a
noisy discard; wheel ruts; two draw calls instead of five; puddles not done), 2.1 (terrain colour blended per pixel
by height and slope with a noisy edge), 3.1 (grass grows in the town as a short lawn, blocked only by footprints,
roads and round ponds, feathered at the edges) and 3.2 (tuft roots take the ground colour, tips fade to it before
the tufts shrink away); grass now grows into the frayed road and square edges. Still to do here: flower stems
keep the old dark green.

Step 4, first pass, typechecked and linted but never rendered or tested, so every brightness is a first guess:
1.5 (new `lighting` slice: lamp glass and the windows of seven building types glow from dusk to dawn, one
instanced additive pool per lamp on all devices, four unshadowed point lights that follow the nearest lamps on
desktop; house-c, barracks, watchtower and windmill have no window swatch and stay dark), 1.6 (hand lantern light
at knee height in front of the player, intensity 14 to 4, reach 16 to 9) and 7.3 (fresnel rim on player and
townsfolk materials, keyed on the key light's brightness so it is strong at dusk and night and faint by day).

Step 4 was rendered for the first time on 2026-11-11 (software Chromium, 1x): lamp glass, windows and the pools
of light all come on at night and read well. Two things to fix under 1.4: the town lawn turns neon yellow-green
in lamplight, and buildings away from a lamp are nearly black (36.7% of the `plaza` night frame is black).

Step 5, first pass, rendered the same way, so colour and shape were checked on screen and frame cost was not:

- 4.1: rocks are chiselled, a subdivided sphere bent by layered waves and sliced by flat cuts. Four shapes
  (boulder and slab at 320 triangles, small stone at 80, pebble cluster at 80 to 100), three of each, in warm
  and cool greys that neighbours share. The falling-rock demo keeps the old lump.
- 4.2: the base is darkened in the vertex colours, and grass keeps off the middle of a rock and thins at its edge.
- 4.3: moss on upward faces under tree crowns, lichen flecks from 8 m up, a dark wet band up to 0.3 m above the
  sea. No foam ring; that comes with 6.2.
- 4.4: nine outcrops of two to four large blocks on the steepest ground, with scree below, and pebbles on flat
  ground (more at the shore). All nine land on the eastern hill, where the steepest ground is. Only 18 pebble
  clusters come out, so beaches are still bare. No stepping stones in ponds.
- 1.8 for trees and rocks: a new ground shade map (1024 px over the island, one channel for contact patches and
  one for canopy), stamped as things are placed and read by the terrain, the grass roots and the rocks. Town
  props, buildings and the wall do not stamp it yet, and the roads and square do not read it.
- 2.5 in part: the canopy channel browns and darkens the ground under crowns. No leaf litter.
- 5.2 (trunks flare into roots and lean up to 4 degrees; the collider stays an upright cylinder), 5.3 (crowns
  sway on the same gust front as the grass) and 5.4 (dark undersides and inner faces, a tint per clump; no lit rim).
- Not done: 5.1 and 5.5. Both need the tree models, and the asset search had no API key in the cloud session
  (`POLYPIZZA_API_KEY`), so no candidates could be shown.

Cost per frame, all devices: one more texture read per terrain pixel; one vertex texture read per grass-blade
vertex and per rock vertex; 371 rocks instead of 256, drawn as one instanced mesh per shape per 50 m cell so
off-screen cells are skipped. Not measured on a device.

## Tools first

Taking these screenshots meant reaching into private fields. Two small tools make every later item checkable.

| #   | Change                                                                                                                                                                                                             | Where                                   | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ---- |
| 0.1 | Debug mode behind `?debug`: set the time of day, free the camera, show draw calls and triangles. The FPS counter moves here.                                                                                       | `diagnostics`, `Game`, `DayNightSystem` | M    |
| 0.2 | `npm run shots`: saves a fixed set of views (plaza, lane, gate, meadow, forest, pond, coast, a rock, an outcrop, shore rocks) at noon, sunset and night, desktop and phone. Every item below is judged against it. | `scripts/shots/` (output is gitignored) | M    |

## 1. Lighting and image

| #    | Seen today                                                                                                                                                                                                                  | Change                                                                                                                                                                                  | Where                                                   | Size |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---- |
| 1.1  | White haze around the sun, drawn over foreground objects. The sky shader's sun disc is far brighter than anything else and the bloom pass spreads it. Desktop only; phones skip bloom.                                      | Turn off the shader's disc (`showSunDisc`), draw our own sun with a controlled brightness, and cap what feeds the bloom. Keep a small, deliberate glow.                                 | `environment/SkyDome.ts`, `rendering/PostProcessing.ts` | S    |
| 1.2  | Stair-stepped edges on roofs, timber and grass. The scene is drawn into a post-processing buffer created without multisampling, so the renderer's `antialias` flag does nothing for it. Phones have no antialiasing at all. | Multisample that buffer (4 samples) on desktop. On phones add a cheap edge-smoothing pass.                                                                                              | `rendering/PostProcessing.ts:19`                        | S    |
| 1.3  | Wall, square and roads nearly white at midday; fine at sunset.                                                                                                                                                              | Retune the day keyframes (sun 2.2 plus sky fill 1.5) together with the palest colours so sunlit stone sits in the mid-tones. Add a brightness histogram to the shots tool as the check. | `environment/dayKeyframes.ts`, `town/render/`           | S    |
| 1.4  | At night anything in moon shadow is black, and moonlit grass stays neon green.                                                                                                                                              | A blue fill light at night so shadows read as dark blue. Make the colour grade follow the hour: less saturation and contrast at night. It is one fixed setting today.                   | `dayKeyframes.ts`, `rendering/ColorGradeShader.ts`      | S    |
| 1.5  | Lantern posts and windows give no light at night.                                                                                                                                                                           | Glowing lamp glass and windows that come on at dusk, with warm pools of light on the ground. Real lights for the nearest few on desktop; painted pools on phones.                       | `town`, `environment`                                   | M    |
| 1.6  | The hand lantern bleaches the character's head to white.                                                                                                                                                                    | Lower it and move it so it lights the ground around the player.                                                                                                                         | `player/LanternFactory.ts`                              | S    |
| 1.7  | Distant land and the horizon fade to white at midday.                                                                                                                                                                       | Fog that tints towards sky blue with distance, and a cloud sheet that thins before the horizon.                                                                                         | `dayKeyframes.ts`, `environment/cloudShader.ts`         | S    |
| 1.8  | Trunks, rocks, props and walls stand on the ground with a hard line. Ambient occlusion softens it a little on desktop only.                                                                                                 | A soft dark patch under every static object, baked into the ground colour or as one instanced decal. Works on phones too.                                                               | `terrain`, `town/render/`                               | M    |
| 1.9  | The sky has drifting clouds but the land never darkens under them.                                                                                                                                                          | Cloud shadows: sample the cloud pattern along the sun direction inside the lighting patch that already rewrites every material. Ties sky to ground for one texture read.                | `rendering/installToonLighting.ts`, `environment`       | M    |
| 1.10 | One shadow map covers a fixed 140 m box: sharp on desktop, about 14 cm per texel on phones, and nothing beyond 70 m from the centre.                                                                                        | A 40 m shadow box that follows the player, snapped to texels so it does not shimmer.                                                                                                    | `environment/SunLight.ts`                               | M    |
| 1.11 | Phones skip the colour grade along with bloom, so their picture is flatter than the desktop's.                                                                                                                              | Fold the grade into the output step so both get the same colours.                                                                                                                       | `rendering/PostProcessing.ts:29`                        | S    |

## 2. Ground and textures

The eight textures in use are 1024 px colour maps, applied as faint grain. No surface uses a normal or roughness map, so
every facet is perfectly flat to the light (see Decisions).

| #   | Seen today                                                                                                                                                                                                 | Change                                                                                                                                                                               | Where                                              | Size |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ---- |
| 2.1 | Terrain colour is one of five flat colours per triangle, chosen by height. Borders are 2.5 m sawteeth, and cliffs are green.                                                                               | Blend the colours per pixel by height and slope with a noisy edge. The shader already computes those weights but uses them only to pick the grain. Lighting stays flat-shaded.       | `terrain/terrainShaderChunks.ts`                   | M    |
| 2.2 | The square and roads are soft grey-brown smears: their colour is painted per vertex on a half-metre grid. `cobblestone.webp`, `road-dirt.webp` and both normal maps (1.4 MB) are shipped but never loaded. | Use those textures. Break the dead-straight edges into a ragged, blended verge (the code computes an edge alpha that the opaque material ignores). Add wheel ruts and a few puddles. | `town/render/RoadMeshFactory.ts`, `groundPatch.ts` | M    |
| 2.3 | The wall is plain boxes.                                                                                                                                                                                   | Cap stones, a plinth, darker mortar, a dirt and moss gradient at the base, and an arch with wooden doors at each gate.                                                               | `town/render/WallFactory.ts`                       | M    |
| 2.4 | Sand meets grass in triangles and meets water in a hard line.                                                                                                                                              | A darker wet band at the waterline, pebbles, and the shore foam from 6.2.                                                                                                            | `terrain`, `rocks`                                 | S    |
| 2.5 | Under trees the ground is the same bright lawn as the open meadow.                                                                                                                                         | Darken and brown the ground under the canopy from the tree positions, and scatter leaf litter.                                                                                       | `terrain`, `vegetation`                            | M    |
| 2.6 | Every building material named "palette" gets plaster grain, including roofs, doors and stone footings.                                                                                                     | Choose the grain per colour region of the palette. Low priority: the buildings already look good.                                                                                    | `rendering/surface/surfaceKindOf.ts`               | M    |

## 3. Grass

93,000 tufts of three blades each, all outside the town. Up close it already looks good.

| #   | Seen today                                                                                                                                             | Change                                                                                                                                                                            | Where                                           | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---- |
| 3.1 | No grass inside the walls: the whole town square is one exclusion zone. Ponds are excluded as squares, leaving bare corners.                           | Exclude only building footprints, roads and the pond circle. Feather every edge: thinner and shorter towards it. A short lawn variant for yards, verges and the foot of the wall. | `app/populateTown.ts:52`, `grass/canGrow.ts`    | M    |
| 3.2 | Dark, saturated roots on a brighter flat ground, so mid-distance tufts read as dark clumps. Past 75 m the grass is gone and the ground changes colour. | Tint each tuft's root with the ground colour under it, and set the far ground colour to the average blade colour so the fade-out is invisible.                                    | `grass/GrassInstancesFactory.ts`, `terrain`     | S    |
| 3.3 | One tuft shape everywhere, spread evenly.                                                                                                              | Patchy density from noise, plus a few kinds: tall seed-head grass, reeds at ponds and shore, ferns in forest shade, dry patches on high ground.                                   | `grass/GrassPlacer.ts`, `grassTuftGeometry.ts`  | M    |
| 3.4 | Flowers are invisible: 315 on the whole island (1,820 asked for) with 4.5 cm heads.                                                                    | Bigger heads, several times as many, planted in drifts.                                                                                                                           | `grass/FlowerInstancesFactory.ts`, `GameConfig` | S    |
| 3.5 | Light never plays on the grass: every blade has the same upward normal.                                                                                | A glow through the blades when looking towards a low sun, and a lighter band that travels with each gust (the gust value is already computed per tuft).                           | `grass/windShaderChunk.ts`                      | M    |
| 3.6 | Blades are up to 10 cm wide, so they read as leaves at the player's feet. Phones get a quarter of the tufts.                                           | Two rings: narrower and denser near the camera, wider and sparser far away, for about the same triangle count.                                                                    | `grass/GrassInstancesFactory.ts`                | M    |

## 4. Stones

| #   | Seen today                                                                                   | Change                                                                                                                                                   | Where                                   | Size |
| --- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---- |
| 4.1 | Each rock is a jittered icosahedron: 20 triangles, six shapes, one grey. They read as lumps. | Three families (boulder, slab, pebble cluster) from a subdivided shape with layered noise and a few flat cuts for a chiselled look. Warm and cool greys. | `rocks/RockMeshFactory.ts:20`           | M    |
| 4.2 | Rocks rest on top of the grass with a hard line.                                             | Sink them a little, darken the base, and let the grass placer crowd tufts around them.                                                                   | `rocks/RockScatterPlacer.ts`, `grass`   | S    |
| 4.3 | Rocks look the same in forest shade, on a hilltop and in the surf.                           | Moss on upward faces in the forest, lichen on high ground, a dark wet band and a foam ring at the shore.                                                 | `rocks`, `rendering/surface/`           | M    |
| 4.4 | 256 rocks in small clusters; steep slopes are stretched grass triangles.                     | A few large outcrops and rock faces on the steepest ground, scree below them, stepping stones in ponds, pebbles on beaches.                              | `rocks/RockScatterPlacer.ts`, `terrain` | M    |

## 5. Trees

| #   | Seen today                                                                                         | Change                                                                                                                                     | Where                                  | Size |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ---- |
| 5.1 | All 340 trees are one mesh (a six-sided trunk and five blobs), varied only by size, turn and tint. | Three or four species with two shapes each: a conifer for high ground, a birch, a broad oak, plus saplings, bushes and the odd dead trunk. | `vegetation/TreeInstancesFactory.ts`   | L    |
| 5.2 | Trunks enter the ground as bare prisms.                                                            | Root flare, a slight lean, and the ground patch from 1.8.                                                                                  | `vegetation`                           | S    |
| 5.3 | Grass sways; tree crowns are frozen.                                                               | Reuse the wind shader on crowns with a slow, small sway.                                                                                   | `vegetation`, `grass/applyWindSway.ts` | S    |
| 5.4 | From below, a crown is a flat pale slab.                                                           | Darker undersides and inner faces, a different tint per clump, a lit rim on the sun side.                                                  | `vegetation/treeCrownGeometry.ts`      | S    |
| 5.5 | The forest floor is empty.                                                                         | Ferns, mushrooms, fallen logs and stumps, placed by the same seeded scatter.                                                               | `vegetation`                           | M    |

## 6. Water and sky

| #   | Seen today                                                               | Change                                                                                                                                                                       | Where                        | Size |
| --- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---- |
| 6.1 | White flecks cover the whole sea evenly and read as noise or ice.        | Fewer flecks, in streaks, fading with distance.                                                                                                                              | `water/waterShaderChunks.ts` | S    |
| 6.2 | No shoreline: the same colour and opacity from the beach to the horizon. | Bake distance-to-shore from the height field into a texture. Use it for a moving foam line, pale shallows and darker deep water. No extra scene pass, so it works on phones. | `water`, `terrain`           | M    |
| 6.3 | The sea is a flat plane.                                                 | A slow swell in the vertex shader and a glitter path towards the sun.                                                                                                        | `water/waterShaderChunks.ts` | S    |
| 6.4 | Ponds use the sea's look.                                                | Calmer, darker water with lily pads and the reeds from 3.3.                                                                                                                  | `water/WaterMeshFactory.ts`  | S    |
| 6.5 | The moon is a blurred disc.                                              | A simple moon face. Low priority; the stars are fine.                                                                                                                        | `environment/NightSky.ts`    | S    |

## 7. Town details

| #   | Seen today                                                                           | Change                                                                                                            | Where                         | Size |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---- |
| 7.1 | Every villager has the player's hair and clothes; the faint tint cannot change them. | Remap the colour swatches of the shared palette texture per villager, and give the player a look nobody else has. | `townsfolk`                   | M    |
| 7.2 | Nothing in the town moves except people.                                             | Chimney smoke, swaying awnings, turning windmill sails if the model allows.                                       | `town`, small `effects` slice | M    |
| 7.3 | Characters merge with dark backgrounds at dusk and night.                            | A thin rim light on characters from the key light's side.                                                         | `player`, `rendering`         | S    |

## Order

Each step ends with `npm run check` passing, the shots re-taken and compared, and a look at the pull request
preview on a real phone and a desktop.

1. **Tools**: 0.1, 0.2.
2. **Cheap fixes to the whole picture**: 1.1, 1.2, 1.3, 1.4, 1.11. All small, and they change every frame.
3. **The ground the player stands on**: 2.2 (the textures are already there), 2.1, 3.1, 3.2.
4. **Night**: 1.5, 1.6, 7.3.
5. **Stones and trees**: 4.1 to 4.4, 5.1 to 5.5, with 1.8.
6. **Water and atmosphere**: 6.1 to 6.4, 1.7, 1.9, 2.4.
7. **Richness**: 3.3 to 3.6, 2.3, 2.5, 7.1, 7.2.
8. **As measurements call for it**: 1.10, 2.6, 6.5.

Budget rule: each item states what it costs per frame and which devices get it. Anything that adds a texture
read or a draw per object is checked against the debug counters from 0.1 on a phone before it merges.

## Decisions

Decided on 2026-11-10, as recommended:

1. **Carved detail on four surfaces.** Cobbles, wall masonry, bark and rock get normal maps. Through the
   two-band lighting they read as crisp chiselled shading, not as realism. Plaster, roofs and foliage stay flat.
2. **Rocks in code, trees from models.** Rocks are generated (endless variety, and colliders already come from
   their hulls). Trees come from a CC0 nature set by the author of the town models, so the styles match,
   through the asset-sourcing skill.
3. **Photo textures stay for now.** The grain textures are photo scans; revisit after 2.1 and 4.1 if bark and
   rock still look photographic up close.

Still open: **real devices.** Frame rate could not be measured while writing or implementing this plan. Someone
needs to open each preview on a phone and a desktop.

## Parked

Not graphics, not in this plan, noted so they are not lost:

- No loading screen, title, pause or settings; the page is black while 5.2 MB of JavaScript loads.
- Movement and camera are functional but raw, and jumping has no animation.
- Nothing stops the player walking under the sea or off the edge of the terrain.
- There is no goal or interaction.
