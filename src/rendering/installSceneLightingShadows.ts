import * as THREE from 'three';

const NEAR_SHADOW =
  'getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] )';

const SHADOW_LINE = `directLight.color *= ( directLight.visible && receiveShadow ) ? ${NEAR_SHADOW} : 1.0;`;

const IBL_LINE = 'iblIrradiance += getIBLIrradiance( geometryNormal );';

const HEMI_LINE = 'irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );';

// Braces: the unrolled loop pastes this body once per light into the same scope. Light 0 is the sun; with
// two shadow casters, light 1 is the unlit far cascade (see `SunLight`), blended in where the near box ends.
const CASCADED = /* glsl */ `{
		float sceneShadow = 1.0;
		if ( directLight.visible && receiveShadow ) {
			float nearWeight = sceneShadowFade( vDirectionalShadowCoord[ i ] );
			sceneShadow = mix( 1.0, ${NEAR_SHADOW}, nearWeight );
			#if NUM_DIR_LIGHT_SHADOWS > 1
			if ( UNROLLED_LOOP_INDEX == 0 ) {
				DirectionalLightShadow farShadow = directionalLightShadows[ 1 ];
				float farLit = mix( 1.0, getShadow( directionalShadowMap[ 1 ], farShadow.shadowMapSize, farShadow.shadowIntensity, farShadow.shadowBias, farShadow.shadowRadius, vDirectionalShadowCoord[ 1 ] ), sceneShadowFade( vDirectionalShadowCoord[ 1 ] ) );
				sceneShadow += ( farLit - 1.0 ) * ( 1.0 - nearWeight );
			}
			#endif
		}
		directLight.color *= mix( sceneShadowTint, vec3( 1.0 ), sceneShadow );
		}`;

/**
 * Patches the shared light loop: cascaded sun shadows that fade out at the far box's edge, shadowed light
 * given a small tinted floor instead of black (see `SceneLightSystem`), and the sky fill scaled by the local street probes.
 * Returns false (and changes nothing) if three.js changed the chunk.
 */
export function installSceneLightingShadows(): boolean {
  const chunk = THREE.ShaderChunk.lights_fragment_begin;
  if (!chunk.includes(SHADOW_LINE) || !chunk.includes(HEMI_LINE)) return false;
  const probed = ' * sceneProbeFactor( geometryPosition, geometryNormal );';
  THREE.ShaderChunk.lights_fragment_begin = chunk
    .replace(SHADOW_LINE, CASCADED)
    .replace(HEMI_LINE, HEMI_LINE.replace(';', probed));
  // The sky's own light (image-based) is shut out of narrow streets the same way.
  const maps = THREE.ShaderChunk.lights_fragment_maps;
  if (maps.includes(IBL_LINE)) {
    THREE.ShaderChunk.lights_fragment_maps = maps.replace(IBL_LINE, IBL_LINE.replace(';', probed));
  }
  return true;
}
