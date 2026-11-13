/**
 * Sunlight focused by a rippled surface onto the bed below, for a tiling height patch (`size` texels square).
 * Every texel of the surface sends its light straight down, bent by the surface's slope there; where
 * neighbouring rays converge the bed is bright (the caustic net), where they spread it is dim. Energy is
 * conserved, so the result averages 1. `focus` is how far (in texels per unit of slope) the rays are bent.
 */
export function causticLight(heights: Float32Array, size: number, focus: number): Float32Array {
  const light = new Float32Array(size * size);
  const at = (x: number, y: number) => heights[((y + size) % size) * size + ((x + size) % size)];
  const SUB = 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const here = at(x, y);
      const dx = (at(x + 1, y) - at(x - 1, y)) / 2;
      const dy = (at(x, y + 1) - at(x, y - 1)) / 2;
      // Second differences, so each texel's rays fan out (or in) across its own width.
      const dxx = at(x + 1, y) - 2 * here + at(x - 1, y);
      const dyy = at(x, y + 1) - 2 * here + at(x, y - 1);
      for (let s = 0; s < SUB * SUB; s++) {
        const ox = ((s % SUB) + 0.5) / SUB - 0.5;
        const oy = (Math.floor(s / SUB) + 0.5) / SUB - 0.5;
        splat(light, size, x + ox - focus * (dx + dxx * ox), y + oy - focus * (dy + dyy * oy), 1 / (SUB * SUB));
      }
    }
  }
  return light;
}

/** Adds `amount` at a fractional texel position, shared between the four texels round it (wrapping). */
function splat(light: Float32Array, size: number, x: number, y: number, amount: number): void {
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const tx = x - fx;
  const ty = y - fy;
  const x0 = ((fx % size) + size) % size;
  const y0 = ((fy % size) + size) % size;
  const x1 = (x0 + 1) % size;
  const y1 = (y0 + 1) % size;
  light[y0 * size + x0] += amount * (1 - tx) * (1 - ty);
  light[y0 * size + x1] += amount * tx * (1 - ty);
  light[y1 * size + x0] += amount * (1 - tx) * ty;
  light[y1 * size + x1] += amount * tx * ty;
}
