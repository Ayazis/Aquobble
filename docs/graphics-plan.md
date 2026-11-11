# Graphics plan, round two

Follows `polish-plan.md`, whose steps 1 to 7 are done. This plan takes over everything that plan left open and
adds the next round: grass that reacts, water that moves things, grass everywhere, better light and shadow, and
five further items for the look.

Same rules as before: stay low-poly and cel-shaded, every item says what it costs per frame and which devices
get it, and each step ends with `npm run check` and a look at the shots (`npm run shots`) and a real phone.

## Where things stand

- **Grass** is placed once at load: 160,000 near tufts and 55,000 far tufts scattered over an 80 m extent, in
  10 m and 20 m cells with `THREE.LOD`. Bending reads only the positions of characters
  (`GrassBendSystem`, radius 0.9 m, `MAX_GRASS_BENDERS` slots). Blades spring back the moment a character
  has passed, nothing else bends them, and beyond 80 m there is no grass at all.
- **Water** is a vertex swell of two sines out to 110 m, plus shader-only foam, flecks and glitter. Nothing in
  the physics world knows the water is there: rocks and the player fall straight through it.
- **Shadows** are one PCF shadow map in a box that follows the camera (60 m desktop, 40 m phone) and fades
  out at its edge. Beyond that box nothing casts a shadow. Ambient occlusion is a depth pass on desktop only.

## 0. Left over from the polish plan

| #   | Item                                                                                                   | Where                                | Size |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------------ | ---- |
| 0.1 | Measure on real devices (still never done). Record FPS, draws and triangles from `?debug` per view.    | `docs/`                              | S    |
| 0.2 | 2.6: grain per colour region of the building palette, so roofs, doors and footings stop being plaster. | `rendering/surface/surfaceKindOf.ts` | M    |
| 0.3 | 1.3: retune the square and road colours against the brightness histogram.                              | `town/render/`                       | S    |
| 0.4 | Phone switch for cloud shadows (`RenderQuality`), kept on unless 0.1 shows they cost too much.         | `rendering`                          | S    |
| 0.5 | Flower stems still use the old dark green; take the grass-tip colour.                                  | `grass/FlowerInstancesFactory.ts`    | S    |
| 0.6 | house-c, barracks, watchtower and windmill have no window glow; add a swatch or a painted glow quad.   | `lighting`, `town`                   | S    |
| 0.7 | 7.2: windmill sails and awnings. Split the sails off the windmill model (Blender) so they can turn.    | `town`, `effects`                    | M    |
| 0.8 | Night: check that the town lawn is no longer neon and buildings away from lamps are not black.         | `lighting`, `dayKeyframes.ts`        | S    |

## 1. Better grass physics

| #   | Change                                                                                                                                                                                                                                                                                                                                                                                                                               | Where                      | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ---- |
| 1.1 | **Trampling trail.** A 128x128 "bend map" (R = push x, G = push z, B = flattened) over a 32 m box that follows the player, like the shadow box. Each frame every character, falling rock and bird landing stamps a soft disc, and the whole map relaxes towards zero (ping-pong render target, one full-screen quad). The grass vertex shader reads it once per tuft. Blades stay flattened behind you and rise back over about 3 s. | `grass`, new `BendMap`     | M    |
| 1.2 | **Spring per blade.** Replace the instant offset with a damped spring in the shader: the bend map stores velocity as well, so a blade overshoots and wobbles once when released instead of snapping upright.                                                                                                                                                                                                                         | `grass/windShaderChunk.ts` | S    |
| 1.3 | **Direction from movement.** Push along the character's velocity, not just radially, so grass parts in front and closes behind. Running pushes harder than walking.                                                                                                                                                                                                                                                                  | `GrassBendSystem`          | S    |
| 1.4 | **Wind with memory.** One wind field (direction + strength, slowly turning, seeded) shared by grass, tree crowns, smoke, cloud drift and water flecks. Gusts become visible fronts crossing the meadow; strength is driven per hour (calm at dawn, gusty afternoon).                                                                                                                                                                 | new `wind` slice           | M    |
| 1.5 | **Rustle feedback.** Small burst of pollen/seed particles and a brighter flash on the blades when the player runs through tall or seed-head grass.                                                                                                                                                                                                                                                                                   | `effects`                  | S    |

Cost: one more vertex texture read per tuft and one 128x128 pass per frame, all devices. Phones use 64x64.

## 2. Water waves and physics

| #   | Change                                                                                                                                                                                                                                                                                                                                                            | Where                        | Size |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---- |
| 2.1 | **Gerstner waves.** Swap the two sines for 4 to 6 Gerstner waves (steepness, length, direction from the wind field in 1.4). Crests sharpen and lean, troughs widen. Normals come from the analytic derivative, so lighting follows the waves. Waves shoal: shorter and steeper where the height map says the water is shallow, and they break into the foam line. | `water/waterShaderChunks.ts` | M    |
| 2.2 | **One wave function on both sides.** A TypeScript copy of the same Gerstner sum (`waveHeightAt(x, z, t)`), unit-tested against fixed values, so simulation can ask where the surface is.                                                                                                                                                                          | `water/WaveField.ts`         | S    |
| 2.3 | **Buoyancy.** A `Buoyant` component and `BuoyancySystem` (fixed): sample 4 points of a body against `waveHeightAt`, push up by submerged depth, add water drag. Goes through `PhysicsEngine` (add `applyImpulseAt`). Driftwood, lily pads and a dropped rock that sinks slowly instead of vanishing.                                                              | `water`, `physics`           | M    |
| 2.4 | **Player in water.** Wading slows the player, deep water makes them swim/bob instead of walking on the sea floor (also fixes a parked item).                                                                                                                                                                                                                      | `player`, `water`            | M    |
| 2.5 | **Ripples.** A small ripple simulation (height-field ping-pong, 256x256 over 40 m round the player) for ponds and the shallows: footsteps, splashes, falling rocks and rain drops make rings that spread and reflect. Its normal is added to the water normal. Splash particles on entry.                                                                         | `water`, `effects`           | M    |
| 2.6 | **Refraction and depth colour.** Read the opaque scene colour behind the water (desktop): wobble it by the wave normal, tint with depth. Phones keep the current opacity blend.                                                                                                                                                                                   | `rendering`, `water`         | M    |

Cost: about 30 more ALU per water vertex; the ripple sim is one 256x256 pass (128 on phones); refraction is one
scene-colour copy, desktop only.

## 3. Grass everywhere, with a draw distance

Static scattering does not scale to the whole island. Replace it with grass that is placed around the camera.

| #   | Change                                                                                                                                                                                                                                                                                                                                                                     | Where                | Size |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---- |
| 3.1 | **Grid of reusable tiles.** One tuft patch (say 8 m, fixed jittered positions) drawn instanced over a grid of tiles round the camera. The vertex shader places each tuft on the ground with the height map, and kills it where a density map says no grass (beach, rock, road, footprint, too steep). Tiles are recycled as the camera moves; no per-tuft data on the CPU. | `grass`              | L    |
| 3.2 | **Density map.** Bake the existing rules (`canGrow`, `GroundRules`, blockers, patchiness, dryness) into one 1024 px texture at load (R = density, G = height scale, B = dryness, A = kind). Placement rules stay testable TS; the shader only reads.                                                                                                                       | `grass`, `terrain`   | M    |
| 3.3 | **Distance bands.** Full blades to 20 m, thinned simple blades to 45 m (desktop) / 30 m (phone), then a "grass card" band of crossed quads to 90 m, and past that the ground shader paints a moving fur texture in grass colour. Each band fades by shrinking tufts, never popping.                                                                                        | `grass`, `terrain`   | M    |
| 3.4 | **Density scales with device.** `RenderQuality` picks tile density and band distances; a frame-time watchdog drops one step if FPS stays under target.                                                                                                                                                                                                                     | `rendering`, `grass` | S    |
| 3.5 | **Grass in the forest and on hills.** With the density map, shade grass under trees (short, dark, sparse), hill grass (short, dry), keep it off the outcrops.                                                                                                                                                                                                              | `grass`              | S    |

Cost: memory drops from about 16 MB of instance data to one patch plus a texture. GPU work stays near today's
350k triangles, but spread over the whole island. Draws: one per band.

## 4. Better lighting and shadows

| #   | Change                                                                                                                                                                                            | Where                           | Size |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---- |
| 4.1 | **Cascaded shadows.** Two cascades on desktop (25 m sharp, 120 m soft), one on phones. Far trees and town keep their shadows to the horizon.                                                      | `environment/SunLight.ts`       | M    |
| 4.2 | **Soft, stylised shadow edge.** PCF with a small poisson kernel plus a hand-picked shadow tint (cool blue by day, deep blue at night) instead of plain dark, so shadows stay part of the palette. | `rendering/installToonLighting` | S    |
| 4.3 | **Grass shadows that are cheap.** Grass does not cast into the map; instead it receives, and a darkened root band fakes self-shadowing. Tree and building shadows fall across the meadow.         | `grass`                         | S    |
| 4.4 | **Bounce light.** A hemisphere fill tinted by the ground under each object (green on the meadow, warm on sand and roads), from the terrain palette. Underside of roofs and crowns pick up colour. | `rendering`, `terrain`          | S    |
| 4.5 | **Light probes for interiors of the town.** A handful of baked SH probes in the streets so alleys and the gate tunnel are darker and warmer than the open meadow.                                 | `lighting`                      | M    |
| 4.6 | **Lamp shadows on desktop.** The single nearest lamp casts a cube shadow (256 px), so posts and passers-by throw shadows at night.                                                                | `lighting`                      | M    |
| 4.7 | **Phone ambient occlusion.** Bake vertex AO into buildings, rocks and tree models at load (few rays per vertex against their own mesh), so phones get contact darkness without the depth pass.    | `rendering`, `town`, `rocks`    | M    |

## 5. Five more points for the art

| #   | Change                                                                                                                                                                                                                                                                                                                                                      | Where                      | Size |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---- |
| 5.1 | **Ink outlines.** A screen-space outline from depth and normals (one pass, desktop and phone at half resolution), thin and coloured darker than the surface rather than black, fading with distance. The single strongest step towards a hand-drawn look and it separates silhouettes against grass.                                                        | `rendering/PostProcessing` | M    |
| 5.2 | **Weather.** Overcast, light rain and morning mist as states of the day cycle: rain streaks and splashes (feeds the ripples in 2.5), wet darkening and shine on roads and roofs, puddles that grow, low ground mist in hollows at dawn. A seeded schedule keeps it reproducible.                                                                            | new `weather` slice        | L    |
| 5.3 | **Atmosphere and god rays.** Height fog that pools in valleys and over the sea, and light shafts through the forest canopy and around the low sun (radial blur of the sky mask, desktop). Sunset gets real depth.                                                                                                                                           | `environment`, `rendering` | M    |
| 5.4 | **Living details.** Butterflies over flower drifts, fireflies at dusk near ponds and the forest edge, dust motes in sunbeams, falling leaves from crowns on gusts, fish ripples in ponds. All instanced particles in `effects`, all from seeded `Random`.                                                                                                   | `effects`, `wildlife`      | M    |
| 5.5 | **Colour script and art direction pass.** One palette document (key colours per hour, per biome) that the keyframes, terrain palette, grass tips and building swatches all read from; a stylised hand-painted sky gradient with banding instead of the physical sky; a slight vignette and paper grain in the grade. Makes the island read as one painting. | `environment`, `rendering` | M    |

## Order

1. **Measure first**: 0.1, then the cheap leftovers 0.3 to 0.6 and 0.8.
2. **Grass everywhere** (3.1 to 3.5): the new grass system is the base the grass physics build on.
3. **Grass physics** (1.1 to 1.3), then the shared wind field (1.4), which water uses next.
4. **Water** (2.1, 2.2 first; then 2.3, 2.4; then 2.5, 2.6).
5. **Light and shadow** (4.1, 4.2, 4.4 first; 4.3 falls out of step 2; then 4.5 to 4.7).
6. **Art**: 5.1 outlines and 5.5 colour script early in this step, since they change every later screenshot;
   then 5.3, 5.4, and 5.2 weather last because it touches everything.
7. Remaining leftovers: 0.2, 0.7, 1.5.

## Open questions

- Outlines (5.1) change the look the most. Try them behind `?debug` first and decide from the shots.
- Swimming (2.4) is half gameplay. Keep it to bobbing and slowdown here unless swimming is wanted.
- Weather (5.2) may want a toggle in the settings that do not exist yet (parked in the polish plan).
