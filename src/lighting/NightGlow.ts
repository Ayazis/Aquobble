import * as THREE from 'three';

/** Lamp glass is the only warm, bright part of the lantern's texture: red far above blue (linear values). */
const LAMP_MASK = 'smoothstep( 0.35, 0.6, nightTexel.r - nightTexel.b )';
/** Window panes are the darkest swatch of the buildings' palette textures; nothing else on them is this dark. */
const WINDOW_MASK = '1.0 - step( 0.05, max( nightTexel.r, max( nightTexel.g, nightTexel.b ) ) )';

const glsl = (v: number): string => v.toFixed(4);

/** Right after the texture read: the raw texel, before vertex colours or surface detail change it. */
const pick = (mask: string): string => `
#ifdef USE_MAP
	vec3 nightTexel = sampledDiffuseColor.rgb;
	float nightMask = ${mask};
#else
	vec3 nightTexel = vec3( 0.0 );
	float nightMask = 0.0;
#endif`;

/**
 * Makes parts of a textured model glow at night, picked by their texture colour in the shader: no extra
 * texture, mesh or draw call. Every patched material reads one shared 0..1 value, `strength`.
 */
export class NightGlow {
  /** 0 by day, 1 at night; written once a frame by `StreetLightSystem`. */
  readonly strength = { value: 0 };

  /** Lamp glass shines in its own colour, `gain` times as bright as the texture. */
  lamp(material: THREE.Material, gain: number): void {
    this.patch(material, LAMP_MASK, `nightTexel * ${glsl(gain)}`);
  }

  /** Window panes shine in one warm `color` (0xRRGGBB) times `gain`. */
  windows(material: THREE.Material, color: number, gain: number): void {
    const c = new THREE.Color(color).multiplyScalar(gain);
    this.patch(material, WINDOW_MASK, `vec3( ${glsl(c.r)}, ${glsl(c.g)}, ${glsl(c.b)} )`);
  }

  /** Runs after any patch already on the material (surface detail), so both apply. */
  private patch(material: THREE.Material, mask: string, light: string): void {
    // Shared materials (window panes, several models on one palette) must be patched once, or the uniform repeats.
    if (material.userData.nightGlow) return;
    material.userData.nightGlow = true;
    const before = material.onBeforeCompile;
    const beforeKey = material.customProgramCacheKey;
    const add = `\ttotalEmissiveRadiance += uNightGlow * nightMask * ${light};`;
    material.onBeforeCompile = (shader, renderer) => {
      before.call(material, shader, renderer);
      shader.uniforms.uNightGlow = this.strength;
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uNightGlow;')
        .replace('#include <map_fragment>', `#include <map_fragment>\n${pick(mask)}`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${add}`);
    };
    material.customProgramCacheKey = () => `${beforeKey.call(material)}|night-glow|${mask}|${light}`;
    material.needsUpdate = true;
  }
}
