import type { GrassBand } from './GrassBand';

/** Blades stand a little outside their tile (pulled into tussocks), so tiles are kept this far (m) past the band. */
const MARGIN = 0.5;

/** Tiles per side of the square that always holds a band's ring, wherever the camera stands in its own tile. */
export function tileSpan(band: GrassBand): number {
  return 2 * Math.ceil((band.fadeOut[1] + MARGIN) / band.tile) + 1;
}

/**
 * Lists the tiles of a band worth drawing for a camera at (x, z): those touching the ring between the band's
 * fades that `wanted` (in view, has grass) accepts. Writes each tile's low corner into `out`, walking square
 * rings outwards from the camera's tile so near tiles are drawn first and hide what is behind them. Returns
 * the number of tiles written; `out` must hold `tileSpan(band) ** 2` of them.
 */
export function visibleGrassTiles(
  band: GrassBand,
  x: number,
  z: number,
  wanted: (minX: number, minZ: number, size: number) => boolean,
  out: Float32Array,
): number {
  const { tile } = band;
  const reach = band.fadeOut[1] + MARGIN;
  const inner = Math.max(band.fadeIn[0] - MARGIN, 0);
  const cx = Math.floor(x / tile);
  const cz = Math.floor(z / tile);
  const rings = (tileSpan(band) - 1) / 2;
  let count = 0;
  const visit = (ix: number, iz: number): void => {
    const minX = ix * tile;
    const minZ = iz * tile;
    const nearX = Math.max(minX - x, 0, x - minX - tile);
    const nearZ = Math.max(minZ - z, 0, z - minZ - tile);
    if (nearX * nearX + nearZ * nearZ > reach * reach) return;
    const farX = Math.max(x - minX, minX + tile - x);
    const farZ = Math.max(z - minZ, minZ + tile - z);
    if (farX * farX + farZ * farZ < inner * inner) return;
    if (!wanted(minX, minZ, tile)) return;
    out[count * 2] = minX;
    out[count * 2 + 1] = minZ;
    count++;
  };
  visit(cx, cz);
  for (let r = 1; r <= rings; r++) {
    for (let i = -r; i <= r; i++) {
      visit(cx + i, cz - r);
      visit(cx + i, cz + r);
    }
    for (let i = -r + 1; i < r; i++) {
      visit(cx - r, cz + i);
      visit(cx + r, cz + i);
    }
  }
  return count;
}
