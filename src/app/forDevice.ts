import { HIGH_QUALITY, type RenderQuality } from '@rendering';
import type { GameConfig } from './GameConfig';

/** Phones/tablets: capped resolution, no AO/bloom, small shadow map, no MSAA, no detail textures. */
export const MOBILE_QUALITY: RenderQuality = {
  maxPixelRatio: 1.25,
  antialias: false,
  shadows: true,
  postEffects: false,
  shadowMapSize: 1024,
  shadowInterval: 2,
  surfaceDetail: false,
};

/** True on touch-first devices, where the GPU budget is a fraction of a desktop's. */
export function isMobileDevice(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
}

/** Render quality and a lighter world (less grass, fewer trees and townsfolk) when running on a phone. */
export function forDevice(config: GameConfig, mobile: boolean): { config: GameConfig; quality: RenderQuality } {
  if (!mobile) return { config, quality: HIGH_QUALITY };
  return {
    quality: MOBILE_QUALITY,
    config: {
      ...config,
      grass: { ...config.grass, grass: { ...config.grass.grass, count: Math.round(config.grass.grass.count / 4) } },
      forest: { ...config.forest, count: Math.round(config.forest.count * 0.6) },
      // Each character is eight skinned draw calls, twice over with shadows.
      townsfolk: { ...config.townsfolk, minCount: 4, maxCount: 6 },
      // Re-baking the sky lighting is a burst of extra passes; do it rarely.
      environment: { ...config.environment, environmentRefreshSeconds: 8 },
    },
  };
}
