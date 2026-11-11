import type { ColourScript, HourColours } from './ColourScript';

const NIGHT: HourColours = {
  skyZenith: 0x0d1428,
  skyHorizon: 0x26324f,
  sun: 0xb4c6f2,
  fog: 0x1b2333,
  shade: 0x34466e,
  bounce: 0x1c2640,
};

const NOON: HourColours = {
  skyZenith: 0x4f8fd8,
  skyHorizon: 0xbfe0f2,
  sun: 0xfff2dc,
  fog: 0xa6cff0,
  shade: 0xb8d4ff,
  bounce: 0x6f8a5c,
};

/**
 * The island's colour script: peach dawn, clear blue noon, rose dusk, blue-violet night. Day keyframes,
 * terrain, grass and town swatches all take their colours from here so the island reads as one painting.
 * Change a colour here, not in the consumer.
 */
export const COLOUR_SCRIPT: ColourScript = {
  night: NIGHT,
  predawn: { ...NIGHT, skyHorizon: 0x3a3a5c, fog: 0x2a2f45 },
  dawn: {
    skyZenith: 0x6a7fb8,
    skyHorizon: 0xf2b88c,
    sun: 0xffa060,
    fog: 0xe8b890,
    shade: 0xe0b8a8,
    bounce: 0x6f8a5c,
  },
  morning: { ...NOON, skyHorizon: 0xdbe8ec, sun: 0xffe2b8, fog: 0xd3e4ee },
  noon: NOON,
  afternoon: { ...NOON, skyHorizon: 0xe8e2d4, sun: 0xffdcae, fog: 0xdcdcd8 },
  dusk: {
    skyZenith: 0x5a5a9a,
    skyHorizon: 0xf0987a,
    sun: 0xff7a40,
    fog: 0xd99a78,
    shade: 0xd8a0a0,
    bounce: 0x6f8a5c,
  },
  nightfall: { ...NIGHT, skyHorizon: 0x40345a, fog: 0x2e2a42 },
  biomes: {
    sand: 0xead9a0,
    meadow: 0x7fc24a,
    forest: 0x4f9a3c,
    rock: 0x9a8f80,
    snow: 0xf2f2f2,
    earth: 0x7a6450,
  },
  grassTips: { cool: [0.7, 0.93, 0.95], warm: [1.45, 0.99, 0.55] },
  buildings: {
    plaster: [0xb3a07e, 0xb9a07a, 0xb5a88b, 0xbdb7ab],
    timber: 0x7a5a3a,
    darkTimber: 0x6e4b2a,
    roof: 0xb5523b,
    stone: 0x8c8c8c,
    iron: 0x333333,
    hay: 0xd8bf5a,
    cloth: 0xb5523b,
    shrub: 0x3f6e35,
  },
};
