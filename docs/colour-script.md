# Colour script

One palette makes the island read as one painting. Every colour that sets the mood lives in
`src/rendering/palette/islandColourScript.ts` (`COLOUR_SCRIPT`, exported from `@rendering`). Change a colour
there, never in the consumer.

## Hours

| Hour      | Time | Sky (horizon → zenith) | Sun       | Fog       | Mood                                  |
| --------- | ---- | ---------------------- | --------- | --------- | ------------------------------------- |
| night     | 0.00 | `#26324f` → `#0d1428`  | moon      | `#1b2333` | blue-violet, shade lifts to dark blue |
| predawn   | 0.20 | `#3a3a5c` → `#0d1428`  | moon      | `#2a2f45` | first violet on the horizon           |
| dawn      | 0.26 | `#f2b88c` → `#6a7fb8`  | `#ffa060` | `#e8b890` | peach horizon, low warm sun           |
| morning   | 0.34 | `#dbe8ec` → `#4f8fd8`  | `#ffe2b8` | `#d3e4ee` | clean, cool haze                      |
| noon      | 0.50 | `#bfe0f2` → `#4f8fd8`  | `#fff2dc` | `#a6cff0` | clear blue, saturated grade           |
| afternoon | 0.66 | `#e8e2d4` → `#4f8fd8`  | `#ffdcae` | `#dcdcd8` | warming, creamy horizon               |
| dusk      | 0.74 | `#f0987a` → `#5a5a9a`  | `#ff7a40` | `#d99a78` | rose horizon, violet zenith           |
| nightfall | 0.80 | `#40345a` → `#0d1428`  | moon      | `#2e2a42` | violet afterglow                      |

`environment/dayKeyframes.ts` copies sky, sun, fog and hemisphere colours from these hours; intensities,
exposure and the grade stay in the keyframes.

## Biomes

Sand `#ead9a0`, meadow `#73ad48`, forest `#4c8a3c`, rock `#9a8f80`, snow `#f2f2f2`, earth `#7a6450`. The
terrain bands (`terrain/TerrainPalette.ts`) and the bare-earth colour of the terrain shader read these, and the
grass roots follow the ground, so grass and land share one green. Grass tips are a per-channel gain over the
ground colour (`grassTips.cool` and `grassTips.warm`).

## Buildings

Warm plaster walls (four close creams), timber browns, terracotta roofs, grey stone footings, near-black iron,
straw hay, terracotta cloth and a deep shrub green. The town's placeholder colours read them
(`town/render/assetColor.ts`). Palette-textured models get a grain per colour region: roofs masonry, doors
wood, footings stone, walls plaster (`rendering/surface/surfaceKindOfColour.ts` and its GLSL twin).

## The painted frame

- **Sky**: a banded horizon-to-zenith gradient with a soft sun wash (`environment/paintedSkyShader.ts`),
  replacing the physical sky. Bands wobble a little so they read as brush strokes.
- **Ink outlines**: darker, cooler copies of the surface colour (never black) on silhouettes and creases,
  fading out between 25 and 110 m. Phones sample at half resolution. `?outlines=0` turns them off.
- **Grade**: saturation, contrast and lift per hour, a slight vignette and a still paper grain.

## Rules

- Night is blue-violet, never black: shade lifts towards blue.
- Warm light, cool shade: sun colours stay on the orange side, shade and fill on the blue side.
- Saturated greens only near the camera; distance sinks into the fog colour of the hour.
