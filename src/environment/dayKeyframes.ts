import type { DayKeyframe } from './DayKeyframe';

const NIGHT: Omit<DayKeyframe, 'time'> = {
  sunColor: 0x9fb4e6,
  sunIntensity: 0.55,
  hemisphereSky: 0x2a3a5c,
  hemisphereGround: 0x14121a,
  hemisphereIntensity: 0.35,
  environmentIntensity: 0.15,
  fogColor: 0x1b2333,
  fogDensity: 0.0035,
  turbidity: 2,
  rayleigh: 0.5,
  exposure: 0.9,
};

const DAY: Omit<DayKeyframe, 'time'> = {
  sunColor: 0xfff2dc,
  sunIntensity: 2.2,
  // Strong blue sky light with a green bounce: shade stays bright and coloured, as in a cel-shaded scene.
  hemisphereSky: 0xb8d4ff,
  hemisphereGround: 0x6f8a5c,
  hemisphereIntensity: 1.5,
  environmentIntensity: 0.35,
  fogColor: 0xbfe0f5,
  fogDensity: 0.0022,
  turbidity: 2.5,
  rayleigh: 1.3,
  exposure: 0.62,
};

/** Night → dawn → morning → noon → evening → dusk → night, sorted by time. */
export const DEFAULT_DAY_KEYFRAMES: readonly DayKeyframe[] = [
  { time: 0, ...NIGHT },
  { time: 0.2, ...NIGHT, fogColor: 0x2a2f45 },
  {
    time: 0.26,
    ...DAY,
    sunColor: 0xffa060,
    sunIntensity: 1.1,
    hemisphereSky: 0xe0b8a8,
    hemisphereIntensity: 0.45,
    environmentIntensity: 0.4,
    fogColor: 0xe8b890,
    fogDensity: 0.0042,
    turbidity: 9,
    rayleigh: 2.6,
  },
  { time: 0.34, ...DAY, sunColor: 0xffe2b8, sunIntensity: 2.3, fogColor: 0xd3e4ee, fogDensity: 0.0026 },
  { time: 0.5, ...DAY },
  { time: 0.66, ...DAY, sunColor: 0xffdcae, sunIntensity: 2.3, fogColor: 0xdcdcd8, fogDensity: 0.0026 },
  {
    time: 0.74,
    ...DAY,
    sunColor: 0xff7a40,
    sunIntensity: 1.1,
    hemisphereSky: 0xd8a0a0,
    hemisphereIntensity: 0.45,
    environmentIntensity: 0.4,
    fogColor: 0xd99a78,
    fogDensity: 0.0042,
    turbidity: 10,
    rayleigh: 3,
  },
  { time: 0.8, ...NIGHT, fogColor: 0x2e2a42 },
];
