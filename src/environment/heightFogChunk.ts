import * as THREE from 'three';

/** Fog is thickest at and below this height (m): the sea and valley floors. */
const BASE = 0.5;
/** How fast the extra fog thins with height (per metre). */
const FALLOFF = 0.12;
/** Share of the plain distance fog left high up, and the extra share pooled at `BASE`. */
const FLOOR = 0.45;
const POOL = 1.6;

const f = (n: number): string => n.toFixed(4);

const PARS = /* glsl */ `
#ifdef USE_FOG
	varying float vFogHeight;
#endif
`;

// World height from the view-space position: undo the view rotation (transpose) after removing its offset.
const VERTEX = /* glsl */ `
#ifdef USE_FOG
	vFogHeight = ( ( mvPosition.xyz - viewMatrix[ 3 ].xyz ) * mat3( viewMatrix ) ).y;
#endif
`;

const FRAGMENT = /* glsl */ `
#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogPool = exp( - max( vFogHeight - ${f(BASE)}, 0.0 ) * ${f(FALLOFF)} );
		float fogAmount = fogDensity * vFogDepth;
		float fogFactor = 1.0 - exp( - fogAmount * fogAmount * ( ${f(FLOOR)} + ${f(POOL)} * fogPool ) );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif
`;

const MARK = 'vFogHeight';

/**
 * Lane D2: height fog. Patches three.js's fog chunks so exponential fog pools low (in valleys and over the
 * sea) and thins up the hills. Applies to every built-in material with `fog: true`; call before the first
 * shader compiles. Safe to call twice.
 */
export function installHeightFog(): void {
  const chunks = THREE.ShaderChunk;
  if (chunks.fog_fragment.includes(MARK)) return;
  chunks.fog_pars_vertex += PARS;
  chunks.fog_vertex += VERTEX;
  chunks.fog_pars_fragment += PARS;
  chunks.fog_fragment = FRAGMENT;
}
