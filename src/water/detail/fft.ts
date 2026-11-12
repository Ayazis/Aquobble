/** In-place radix-2 FFT of one row: `re`/`im` hold `n` (a power of two) values spaced `stride` apart from `offset`. */
function transformRow(re: Float32Array, im: Float32Array, offset: number, stride: number, n: number): void {
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const a = offset + i * stride;
      const b = offset + j * stride;
      [re[a], re[b]] = [re[b], re[a]];
      [im[a], im[b]] = [im[b], im[a]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (2 * Math.PI) / len;
    for (let start = 0; start < n; start += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(angle * k);
        const wi = Math.sin(angle * k);
        const a = offset + (start + k) * stride;
        const b = a + (len / 2) * stride;
        const tr = re[b] * wr - im[b] * wi;
        const ti = re[b] * wi + im[b] * wr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
      }
    }
  }
}

/**
 * Unnormalised inverse 2D FFT in place, for a square grid of side `n` (a power of two). Mode (i, j) sits at
 * index `j * n + i`; negative frequencies wrap (i = n - 1 is frequency -1). The result tiles seamlessly.
 */
export function inverseFft2d(re: Float32Array, im: Float32Array, n: number): void {
  for (let row = 0; row < n; row++) transformRow(re, im, row * n, 1, n);
  for (let column = 0; column < n; column++) transformRow(re, im, column, n, n);
}
