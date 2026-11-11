/**
 * Fragment code run just before `<opaque_fragment>`: light shining through the blades when the camera looks
 * towards a low key light (`directionalLights[0]`). Strongest with the light just above the horizon, gone once
 * it is high; only a warm key light glows, so the cool moon at night gives none. `vGrassTip` (0 at the root, 1
 * at the tip) keeps it to the thin upper blade. No uniforms of its own: it follows the key light as it moves.
 *
 * Tunables:
 * - GLOW_HEIGHT: key light elevation (sine) where the glow is fully on, and where it has faded out.
 * - GLOW_POWER: how tightly the glow gathers around the direction of the light.
 * - GLOW_STRENGTH: how bright it gets, as a share of the key light through the blade's own colour.
 */
export const GRASS_GLOW_FRAGMENT = /* glsl */ `
#if NUM_DIR_LIGHTS > 0
{
	const vec2 GLOW_HEIGHT = vec2( 0.12, 0.45 );
	const float GLOW_POWER = 5.0;
	const float GLOW_STRENGTH = 1.1;

	vec3 glowKey = directionalLights[ 0 ].color;
	vec3 glowDir = directionalLights[ 0 ].direction;
	float glowHeight = dot( glowDir, normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz ) );
	float glowLow = smoothstep( -0.04, 0.03, glowHeight ) * ( 1.0 - smoothstep( GLOW_HEIGHT.x, GLOW_HEIGHT.y, glowHeight ) );
	float glowWarm = saturate( ( glowKey.r - glowKey.b ) / max( glowKey.r, 1e-3 ) * 3.0 );
	float glowFacing = pow( saturate( dot( normalize( -vViewPosition ), glowDir ) ), GLOW_POWER );
	outgoingLight += glowKey * diffuseColor.rgb * ( glowFacing * glowLow * glowWarm * vGrassTip * GLOW_STRENGTH );
}
#endif
`;
