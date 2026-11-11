import * as THREE from 'three';

const NEAR_SHADOW =
  'getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] )';

const SHADOW_LINE = `directLight.color *= ( directLight.visible && receiveShadow ) ? ${NEAR_SHADOW} : 1.0;`;

const HEMI_LINE = 'irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );';

// Braces: the unrolled loop pastes this body once per light into the same scope. Light 0 is the sun; with
// two shadow casters, light 1 is the unlit far cascade (see `SunLight`), blended in where the near box ends.
const CASCADED = /* glsl */ `{
		float toonShadow = 1.0;
		if ( directLight.visible && receiveShadow ) {
			float nearWeight = toonShadowFade( vDirectionalShadowCoord[ i ] );
			toonShadow = mix( 1.0, ${NEAR_SHADOW}, nearWeight );
			#if NUM_DIR_LIGHT_SHADOWS > 1
			if ( UNROLLED_LOOP_INDEX == 0 ) {
				DirectionalLightShadow farShadow = directionalLightShadows[ 1 ];
				float farLit = mix( 1.0, getShadow( directionalShadowMap[ 1 ], farShadow.shadowMapSize, farShadow.shadowIntensity, farShadow.shadowBias, farShadow.shadowRadius, vDirectionalShadowCoord[ 1 ] ), toonShadowFade( vDirectionalShadowCoord[ 1 ] ) );
				toonShadow += ( farLit - 1.0 ) * ( 1.0 - nearWeight );
			}
			#endif
		}
		directLight.color *= mix( toonShadowTint, vec3( 1.0 ), toonShadow );
		}`;

/**
 * Patches the shared light loop: cascaded sun shadows that fade out at the far box's edge, shadowed light
 * tinted towards a palette colour instead of black, and the sky fill scaled by the local street probes.
 * Returns false (and changes nothing) if three.js changed the chunk.
 */
export function installToonLightingShadows(): boolean {
  const chunk = THREE.ShaderChunk.lights_fragment_begin;
  if (!chunk.includes(SHADOW_LINE) || !chunk.includes(HEMI_LINE)) return false;
  THREE.ShaderChunk.lights_fragment_begin = chunk
    .replace(SHADOW_LINE, CASCADED)
    .replace(HEMI_LINE, HEMI_LINE.replace(';', ' * toonProbeFactor( geometryPosition, geometryNormal );'));
  return true;
}
