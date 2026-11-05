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
  sunColor: 0xfff0d8,
  sunIntensity: 2.6,
  hemisphereSky: 0xc4dbff,
  hemisphereGround: 0x4a3b2a,
  hemisphereIntensity: 0.6,
  environmentIntensity: 0.55,
  fogColor: 0xd8d6cc,
  fogDensity: 0.003,
  turbidity: 6,
  rayleigh: 1.8,
  exposure: 0.55,
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
  { time: 0.34, ...DAY, sunColor: 0xffe2b8, sunIntensity: 2.3, fogColor: 0xe3d3bd, fogDensity: 0.0034 },
  { time: 0.5, ...DAY },
  { time: 0.66, ...DAY, sunColor: 0xffdcae, sunIntensity: 2.3, fogColor: 0xe6d0b2, fogDensity: 0.0032 },
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
