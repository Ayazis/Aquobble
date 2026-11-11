import { HIGH_QUALITY, type RenderQuality } from '@rendering';
import type { GameConfig } from './GameConfig';

/** Phones/tablets: capped resolution, no AO/bloom, small shadow map, no MSAA, no detail textures. */
export const MOBILE_QUALITY: RenderQuality = {
  maxPixelRatio: 1.25,
  antialias: false,
  shadows: true,
  postEffects: false,
  shadowMapSize: 1024,
  shadowBoxSize: 40,
  shadowInterval: 2,
  surfaceDetail: false,
  // lane D: light
  shadowCascades: 1,
  farShadowBoxSize: 120,
  cloudShadows: true,
  vertexAo: true,
  // end lane D
  lampShadows: false, // lane D2
  godRays: false, // lane D2
  grassDensity: 0.35, // lane B: grass
  grassMidDistance: 30, // lane B: grass
  grassBendMapSize: 64, // lane B2: grass physics
  refraction: false, // lane H
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
      // lane B: grass. The grass field itself thins through `grassDensity`; the density map stays the same.
      grass: {
        ...config.grass,
        seedHeads: { ...config.grass.seedHeads, clumps: Math.round(config.grass.seedHeads.clumps / 2) },
        shoreReeds: { ...config.grass.shoreReeds, clumps: Math.round(config.grass.shoreReeds.clumps / 2) },
      },
      // Tree models are 1.6k to 6.5k triangles; phones swap to the 210-triangle stand-ins much sooner.
      forest: {
        ...config.forest,
        count: Math.round(config.forest.count * 0.6),
        detail: { treeDistance: 40, floorDistance: 26 },
      },
      // Each character is eight skinned draw calls, twice over with shadows.
      townsfolk: { ...config.townsfolk, minCount: 4, maxCount: 6 },
      // Re-baking the sky lighting is a burst of extra passes; do it rarely.
      environment: { ...config.environment, environmentRefreshSeconds: 8 },
      // No real lamp lights (each one is extra work in every lit pixel): the painted pools carry the look alone.
      streetLights: { ...config.streetLights, lightCount: 0, poolStrength: 0.42 },
    },
  };
}
