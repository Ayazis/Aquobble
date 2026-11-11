import type { RenderQuality } from '@rendering';
import type { MenuSettings } from './MenuSettings';

/** The device's render quality with the menu's start-up choices (shadows, grass) laid over it. */
export function applyQualitySettings(
  quality: RenderQuality,
  s: Pick<MenuSettings, 'shadows' | 'grass'>,
): RenderQuality {
  const q = { ...quality };
  if (s.shadows === 'off') Object.assign(q, { shadows: false, lampShadows: false });
  if (s.shadows === 'low') Object.assign(q, { shadows: true, shadowMapSize: 1024, shadowCascades: 1 });
  if (s.shadows === 'high') Object.assign(q, { shadows: true, shadowMapSize: 4096, shadowCascades: 2 });
  if (s.grass === 'low') q.grassDensity = 0.35;
  if (s.grass === 'high') q.grassDensity = 1;
  return q;
}
