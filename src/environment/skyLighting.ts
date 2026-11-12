import type { Vec3 } from '@core';
import { COLOUR_SCRIPT } from '@rendering';
import type { Atmosphere, Rgb } from './Atmosphere';
import { linearRgb, luma, mix3, scale3 } from './rgb';

/** Sun light on a surface facing it at noon is about this bright (three.js light intensity). */
const SUN_LUX = 6.6;
/** Moonlight is art-directed, not physical: bright enough to read the island by. */
const MOON = scale3(linearRgb(COLOUR_SCRIPT.night.sun), 0.85);
const NIGHT_ZENITH = scale3(linearRgb(COLOUR_SCRIPT.night.skyZenith), 1.6);
const NIGHT_HORIZON = scale3(linearRgb(COLOUR_SCRIPT.night.skyHorizon), 1.3);
const NIGHT_FOG = linearRgb(COLOUR_SCRIPT.night.fog);
const NIGHT_FILL = linearRgb(COLOUR_SCRIPT.night.shade);
/** Average ground colour (as an albedo) for the bounce light; `SceneLightSystem` tints it by the ground underfoot. */
const BOUNCE = linearRgb(COLOUR_SCRIPT.noon.bounce);
const TWILIGHT: Rgb = [0.5, 0.2, 0.16];
/** Height (direction y) over which the key light fades out near the horizon while sun and moon swap. */
const HORIZON_FADE = 0.08;
/** The sun's disc is this many times brighter than a white wall in its light: it blooms. */
const DISC = 26;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Everything the scene's lights and the sky shaders need for one position of the sun. */
export interface SkyLighting {
  /** Unit direction towards the key light: the sun by day, the moon by night. */
  lightDir: Vec3;
  /** Key light colour times strength (linear). */
  key: Rgb;
  /** Average radiance of the sky: what lights the clouds from all round, and the haze. */
  ambient: Rgb;
  /** Sky side of the hemisphere fill: nothing by day (the sky map lights the scene), a blue lift at night. */
  fill: Rgb;
  /** Ground side of the hemisphere fill: sunlight and skylight thrown back up by the ground. */
  bounce: Rgb;
  fog: Rgb;
  sunDisc: Rgb;
  nightZenith: Rgb;
  nightHorizon: Rgb;
  twilight: Rgb;
  /** 0 by day, 1 once the sun is well down: stars, moon and the night colours. */
  night: number;
  /** How bright the daylit scene is; the exposure adapts to it. 0 at night. */
  brightness: number;
}

/**
 * Lighting for a sun at `sun` (unit direction, below the horizon at night) under `overcast` (0..1) cloud.
 * By day every colour comes out of the atmosphere model; the night is painted from the colour script.
 */
export function skyLighting(atmosphere: Atmosphere, sun: Vec3, overcast = 0): SkyLighting {
  const night = 1 - smooth(-0.1, 0, sun.y);
  const up = sun.y >= 0;
  const fade = Math.min(1, Math.abs(sun.y) / HORIZON_FADE);
  const sunLight = scale3(atmosphere.sunColour(sun, overcast), SUN_LUX * (1 - 0.8 * overcast));
  const key = up ? scale3(sunLight, fade) : scale3(MOON, fade * night);
  const lightDir = up ? sun : { x: -sun.x, y: -sun.y, z: -sun.z };

  // The horizon to either side of the sun, and the zenith: the sky's light without the glare round the sun.
  const flat = Math.hypot(sun.x, sun.z) || 1;
  const side = { x: (-sun.z / flat) * 0.995, y: 0.1, z: (sun.x / flat) * 0.995 };
  const horizon = atmosphere.skyRadiance(side, sun, overcast);
  const zenith = atmosphere.skyRadiance({ x: 0, y: 1, z: 0 }, sun, overcast);
  const day = mix3(zenith, horizon, 0.6);
  const dark = scale3(mix3(NIGHT_ZENITH, NIGHT_HORIZON, 0.5), night);
  const ambient: Rgb = [day[0] + dark[0], day[1] + dark[1], day[2] + dark[2]];
  // Ground bounce: what the lit ground throws back up at walls and eaves.
  const reach = Math.max(lightDir.y, 0);
  const bounce = BOUNCE.map((albedo, i) => albedo * (key[i] * reach + ambient[i] * Math.PI)) as Rgb;
  const dusk = smooth(-0.16, -0.03, sun.y) * (1 - smooth(0, 0.14, sun.y));
  return {
    lightDir,
    key,
    ambient,
    fill: scale3(NIGHT_FILL, night),
    bounce,
    fog: [0, 1, 2].map((i) => horizon[i] * 0.9 + NIGHT_FOG[i] * night) as Rgb,
    sunDisc: scale3(atmosphere.sunColour(sun, overcast), SUN_LUX * DISC * (1 - overcast)),
    nightZenith: scale3(NIGHT_ZENITH, night),
    nightHorizon: scale3(NIGHT_HORIZON, night),
    twilight: scale3(TWILIGHT, 0.2 * dusk * (1 - 0.7 * overcast)),
    night,
    brightness: up ? (luma(sunLight) * Math.max(sun.y, 0.1)) / 12 + luma(day) : luma(day),
  };
}
