/** The wall's materials, each with its own base colour. */
export type WallPart = 'stone' | 'cap' | 'plinth' | 'wood' | 'iron';

/** Stone and cap sit in the mid-tones so the sunlit wall does not bleach at noon (polish plan 1.3). */
const BASE: Record<WallPart, number> = {
  stone: 0x9a8e78,
  cap: 0xaba18c,
  plinth: 0x7d7262,
  wood: 0x7a5232,
  iron: 0x3b3734,
};
const DIRT = 0x6a5841;
const MOSS = 0x5f6c3a;
/** Height up to which dirt splashes on the stone. */
export const DIRT_HEIGHT = 0.5;
/** Height up to which moss creeps up the stone. */
export const MOSS_HEIGHT = 1.4;

const rgb = (hex: number): [number, number, number] => [
  ((hex >> 16) & 255) / 255,
  ((hex >> 8) & 255) / 255,
  (hex & 255) / 255,
];
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t) as [number, number, number];

/** Linear-ish sRGB colour of a wall part at height `y` above the ground: dirt and moss gradient at the base. */
export function wallTint(part: WallPart, y: number): [number, number, number] {
  let colour = rgb(BASE[part]);
  if (part === 'wood' || part === 'iron') return colour;
  colour = mix(colour, rgb(MOSS), 0.55 * (1 - smooth(0.2, MOSS_HEIGHT, y)));
  return mix(colour, rgb(DIRT), 0.85 * (1 - smooth(0, DIRT_HEIGHT, y)));
}
