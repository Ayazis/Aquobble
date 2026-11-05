/** GPU cost knobs. Phones get a cheaper profile (see `app/qualityFor`). */
export interface RenderQuality {
  /** Upper bound for devicePixelRatio; the biggest single cost on high-DPI phones. */
  maxPixelRatio: number;
  antialias: boolean;
  shadows: boolean;
  /** Ambient occlusion + bloom. Off means a plain render with tone mapping only. */
  postEffects: boolean;
  /** Sun shadow map resolution (square). */
  shadowMapSize: number;
}

export const HIGH_QUALITY: RenderQuality = {
  maxPixelRatio: 2,
  antialias: true,
  shadows: true,
  postEffects: true,
  shadowMapSize: 4096,
};
