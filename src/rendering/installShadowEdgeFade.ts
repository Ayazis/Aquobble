import * as THREE from 'three';

const LINE =
  'directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;';

// Braces: the unrolled loop pastes this body once per light into the same scope.
const FADED = /* glsl */ `{
		vec2 shadowEdge = abs( vDirectionalShadowCoord[ i ].xy / vDirectionalShadowCoord[ i ].w - 0.5 );
		float shadowFade = 1.0 - smoothstep( 0.4, 0.5, max( shadowEdge.x, shadowEdge.y ) );
		${LINE.replace('getShadow(', 'mix( 1.0, getShadow(').replace(' ) : 1.0;', ' ), shadowFade ) : 1.0;')}
		}`;

/**
 * Fades sun shadows out over the outer fifth of the shadow box, so a long shadow (the island's at sunset)
 * thins away instead of stopping at a straight edge. Lit materials of every kind share this chunk.
 */
export function installShadowEdgeFade(): void {
  const chunk = THREE.ShaderChunk.lights_fragment_begin;
  if (chunk.includes(LINE)) THREE.ShaderChunk.lights_fragment_begin = chunk.replace(LINE, FADED);
}
