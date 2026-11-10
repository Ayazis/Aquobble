/**
 * Fragment code run just before `<opaque_fragment>`: a thin fresnel edge on the side of the key light
 * (`directionalLights[0]`: the sun by day, the moon at night). It needs no uniforms of its own: how dark it
 * is comes from the key light's own strength, so nothing has to be updated per frame.
 *
 * Tunables (linear light, before tone mapping):
 * - RIM_EDGE: fresnel range of the edge; a higher start gives a thinner line.
 * - RIM_NIGHT / RIM_DAY: strength at dusk and night, and in full daylight.
 * - RIM_DAY_LUMA: key light luminance below which it counts as dusk/night, and above which as full day.
 *   Moon and low sun are about 0.4 to 0.65, the daytime sun 1.6 and up (see `dayKeyframes.ts`).
 * - RIM_SWAP_LUMA: below this (sun and moon swapping at the horizon) the edge loses its side and tint, so
 *   it does not jump when the light direction flips.
 * - RIM_HEADROOM: surfaces already this bright get no rim, so sunlit faces never go to white.
 */
export const CHARACTER_RIM_FRAGMENT = /* glsl */ `
#if NUM_DIR_LIGHTS > 0
{
	const vec2 RIM_EDGE = vec2( 0.62, 0.74 );
	const float RIM_NIGHT = 0.3;
	const float RIM_DAY = 0.06;
	const vec2 RIM_DAY_LUMA = vec2( 0.7, 1.5 );
	const float RIM_SWAP_LUMA = 0.15;
	const float RIM_HEADROOM = 0.8;
	const vec3 RIM_COOL = vec3( 0.62, 0.72, 1.0 );
	const vec3 RIM_LUMA = vec3( 0.2126, 0.7152, 0.0722 );

	vec3 rimKey = directionalLights[ 0 ].color;
	float rimKeyLuma = dot( rimKey, RIM_LUMA );
	float rimKeyOn = saturate( rimKeyLuma / RIM_SWAP_LUMA );
	float rimEdge = smoothstep( RIM_EDGE.x, RIM_EDGE.y, 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) ) );
	float rimSide = smoothstep( -0.3, 0.5, dot( normal, directionalLights[ 0 ].direction ) );
	rimSide = mix( 0.5, rimSide, rimKeyOn );
	float rimStrength = mix( RIM_NIGHT, RIM_DAY, smoothstep( RIM_DAY_LUMA.x, RIM_DAY_LUMA.y, rimKeyLuma ) );
	vec3 rimTint = mix( RIM_COOL, rimKey / max( max( rimKey.r, rimKey.g ), max( rimKey.b, 1e-3 ) ), rimKeyOn );
	float rimRoom = 1.0 - saturate( dot( outgoingLight, RIM_LUMA ) / RIM_HEADROOM );
	outgoingLight += rimTint * ( rimEdge * rimSide * rimStrength * rimRoom );
}
#endif
`;
