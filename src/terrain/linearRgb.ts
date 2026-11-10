/** An sRGB hex colour as linear-space [r, g, b] in 0..1 (the space shaders and instance colours work in). */
export function linearRgb(hex: number): [number, number, number] {
  const channel = (shift: number) => (((hex >> shift) & 255) / 255) ** 2.2;
  return [channel(16), channel(8), channel(0)];
}
