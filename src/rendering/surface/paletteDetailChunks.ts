import type { SurfaceKind } from './SurfaceKind';

/**
 * The kinds a palette-textured building picks from per pixel, in slot order. Must match the branches of
 * `PALETTE_FRAGMENT_MAIN`, which mirror `surfaceKindOfColour`.
 */
export const PALETTE_KINDS: readonly SurfaceKind[] = ['plaster', 'masonry', 'wood', 'stone'];

const slot = (i: number) => /* glsl */ `
uniform sampler2D uPaletteMap${i};
uniform float uPaletteStrength${i};
uniform float uPaletteScale${i};
vec3 paletteDetail${i}(vec3 pos, vec3 w) {
  if (uPaletteStrength${i} <= 0.0) return vec3(1.0);
  vec3 mean = max(textureLod(uPaletteMap${i}, vec2(0.5), 16.0).rgb, vec3(0.04));
  vec3 p = pos * uPaletteScale${i};
  vec3 d = texture2D(uPaletteMap${i}, p.zy).rgb * w.x + texture2D(uPaletteMap${i}, p.xz).rgb * w.y
    + texture2D(uPaletteMap${i}, p.xy).rgb * w.z;
  return mix(vec3(1.0), clamp(d / mean, 0.0, 2.0), uPaletteStrength${i});
}
`;

export const PALETTE_FRAGMENT_PARS = PALETTE_KINDS.map((_, i) => slot(i)).join('');

/**
 * Per pixel: classify the palette colour (roof, door, footing or wall) and apply that kind's grain, so one
 * palette material gets a different grain per colour region.
 */
export const PALETTE_FRAGMENT_MAIN = /* glsl */ `
{
  vec3 n = normalize(cross(dFdx(vDetailPos), dFdy(vDetailPos)));
  vec3 w = pow(abs(n), vec3(4.0));
  w /= (w.x + w.y + w.z);
  vec3 c = pow(max(diffuseColor.rgb, vec3(0.0)), vec3(1.0 / 2.2));
  float hi = max(c.r, max(c.g, c.b));
  float lo = min(c.r, min(c.g, c.b));
  float sat = hi > 0.0 ? (hi - lo) / hi : 0.0;
  vec3 detail;
  if (sat < 0.15) {
    detail = hi > 0.72 ? paletteDetail0(vDetailPos, w) : paletteDetail3(vDetailPos, w);
  } else if ((c.r == hi && c.r - c.g > 0.18 && sat > 0.4) || (c.b == hi && sat > 0.2 && hi < 0.7)) {
    detail = paletteDetail1(vDetailPos, w);
  } else if (c.r >= c.g && c.g >= c.b && hi < 0.62) {
    detail = paletteDetail2(vDetailPos, w);
  } else {
    detail = paletteDetail0(vDetailPos, w);
  }
  diffuseColor.rgb *= detail;
}
`;
