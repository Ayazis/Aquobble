import type { SurfaceKind } from './SurfaceKind';

/** One detail texture and how it is laid over a surface. */
export interface SurfaceDetailSource {
  /** Path under public/, relative to the site base URL. */
  path: string;
  /** Texture repeats per metre. */
  scale: number;
  /** 0 = flat colour only, 1 = full texture contrast. */
  strength: number;
}

/** Kinds without an entry keep their flat colour. */
export type SurfaceDetailSources = Partial<Record<SurfaceKind, SurfaceDetailSource>>;

export const DEFAULT_SURFACE_DETAILS: SurfaceDetailSources = {
  stone: { path: 'assets/textures/rock.webp', scale: 0.3, strength: 0.47 },
  masonry: { path: 'assets/textures/stone-blocks.webp', scale: 0.25, strength: 0.5 },
  wood: { path: 'assets/textures/wood-planks.webp', scale: 0.6, strength: 0.44 },
  bark: { path: 'assets/textures/bark.webp', scale: 0.5, strength: 0.5 },
  foliage: { path: 'assets/textures/foliage.webp', scale: 0.4, strength: 0.39 },
  plaster: { path: 'assets/textures/plaster.webp', scale: 0.35, strength: 0.39 },
};
