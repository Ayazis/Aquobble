/**
 * Fragment code run just before `<opaque_fragment>` on tree crowns: a soft lit rim on the side facing the
 * key light (`directionalLights[0]`), coloured by the leaves themselves so it reads as light through the
 * outer leaves rather than a white line. Driven only by the key light's own colour and direction, so it
 * needs no uniforms: strongest in daylight, faint under the moon. A few ALU ops per crown pixel.
 */
export const CROWN_RIM_FRAGMENT = /* glsl */ `
#if NUM_DIR_LIGHTS > 0
{
	const vec2 CROWN_RIM_EDGE = vec2( 0.45, 0.85 );
	const vec3 CROWN_RIM_LUMA = vec3( 0.2126, 0.7152, 0.0722 );
	vec3 crownKey = directionalLights[ 0 ].color;
	float crownKeyLuma = dot( crownKey, CROWN_RIM_LUMA );
	float crownFacing = abs( dot( normal, normalize( vViewPosition ) ) );
	float crownEdge = smoothstep( CROWN_RIM_EDGE.x, CROWN_RIM_EDGE.y, 1.0 - saturate( crownFacing ) );
	float crownSide = smoothstep( 0.0, 0.6, dot( normal, directionalLights[ 0 ].direction ) );
	float crownStrength = mix( 0.05, 0.22, smoothstep( 0.5, 1.6, crownKeyLuma ) );
	vec3 crownTint = crownKey * ( diffuseColor.rgb * 1.6 + 0.04 );
	outgoingLight += crownTint * ( crownEdge * crownSide * crownStrength );
}
#endif
`;
