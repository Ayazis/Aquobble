import * as THREE from 'three';

/**
 * Lane D2: light shafts. Marches from each pixel towards the sun's screen position and counts how much open
 * sky (depth at the far plane) lies on the way, so gaps in the canopy and around hills streak with light.
 * Added to the linear scene colour, before bloom and tone mapping.
 */
export const GodRayShader = {
  name: 'GodRayShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    sunScreen: { value: new THREE.Vector2(0.5, 0.5) },
    color: { value: new THREE.Color(1, 1, 1) },
    strength: { value: 0 },
  },
  vertexShader: /* glsl */ `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,
  fragmentShader: /* glsl */ `
#define SAMPLES 32
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform vec2 sunScreen;
uniform vec3 color;
uniform float strength;
varying vec2 vUv;
void main() {
	vec4 scene = texture2D( tDiffuse, vUv );
	if ( strength <= 0.0 ) { gl_FragColor = scene; return; }
	vec2 march = ( sunScreen - vUv ) * ( 0.85 / float( SAMPLES ) );
	vec2 uv = vUv;
	float weight = 1.0;
	float light = 0.0;
	for ( int i = 0; i < SAMPLES; i++ ) {
		uv += march;
		vec2 c = clamp( uv, 0.0, 1.0 );
		light += step( 0.9999, texture2D( tDepth, c ).x ) * weight;
		weight *= 0.95;
	}
	// Normalise by the weight sum (about 16) and fade with distance from the sun on screen.
	light *= 0.062;
	float near = 1.0 - smoothstep( 0.0, 0.9, length( ( vUv - sunScreen ) * vec2( 1.6, 1.0 ) ) );
	gl_FragColor = vec4( scene.rgb + color * light * near * strength, scene.a );
}`,
};
