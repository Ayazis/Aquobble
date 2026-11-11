import { MAX_TOON_PROBES } from './ToonLightUniforms';

/**
 * GLSL declarations for the lighting patch, prepended to `lights_pars_begin` so every lit material has them.
 * Materials without the uniforms read zeros: black shadow tint (plain three.js shadows) and no probes.
 */
export function toonLightingChunk(): string {
  return /* glsl */ `
  uniform vec3 toonShadowTint;
  uniform vec4 toonProbePos[ ${MAX_TOON_PROBES} ];
  uniform vec4 toonProbeSh[ ${MAX_TOON_PROBES} ];

  // 1 inside a shadow box, fading to 0 over its outer fifth, so a cascade hands over without a seam.
  float toonShadowFade( vec4 shadowCoord ) {
    vec2 edge = abs( shadowCoord.xy / shadowCoord.w - 0.5 );
    return 1.0 - smoothstep( 0.4, 0.5, max( edge.x, edge.y ) );
  }

  // Sky-fill multiplier from the nearby street probes: enclosed alleys and the gate tunnel get darker and
  // warmer (light bounced off plaster and timber) than the open meadow, where this is 1.
  vec3 toonProbeFactor( vec3 viewPosition, vec3 viewNormal ) {
    vec3 world = cameraPosition + ( vec4( viewPosition, 0.0 ) * viewMatrix ).xyz;
    vec3 normal = ( vec4( viewNormal, 0.0 ) * viewMatrix ).xyz;
    float weight = 0.0;
    float open = 0.0;
    for ( int k = 0; k < ${MAX_TOON_PROBES}; k ++ ) {
      vec4 probe = toonProbePos[ k ];
      if ( probe.w <= 0.0 ) continue;
      float w = 1.0 - smoothstep( 0.4 * probe.w, probe.w, distance( world, probe.xyz ) );
      vec4 sh = toonProbeSh[ k ];
      open += w * clamp( sh.x + dot( sh.yzw, normal ), 0.25, 1.0 );
      weight += w;
    }
    if ( weight <= 0.0 ) return vec3( 1.0 );
    float o = open / weight;
    vec3 probe = o * mix( vec3( 1.0, 0.86, 0.7 ), vec3( 1.0 ), o );
    return mix( vec3( 1.0 ), probe, min( weight, 1.0 ) );
  }
`;
}
