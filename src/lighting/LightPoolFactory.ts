import * as THREE from 'three';
import type { Vec3 } from '@core';
import type { LightPools } from './LightPools';

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
	vUv = uv;
	vec4 local = vec4( position, 1.0 );
	#ifdef USE_INSTANCING
		local = instanceMatrix * local;
	#endif
	gl_Position = projectionMatrix * modelViewMatrix * local;
}`;

/** A bright core with a clean edge inside a soft halo: two bands of light, like the cel shading around it. */
const FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main() {
	float d = min( 1.0, length( vUv - 0.5 ) * 2.0 );
	float halo = ( 1.0 - d ) * ( 1.0 - d );
	float core = 1.0 - smoothstep( 0.42, 0.56, d );
	gl_FragColor = vec4( uColor * uStrength * ( 0.65 * halo + 0.35 * core ), 1.0 );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;

/**
 * Builds the pools of lamplight on the ground: one flat quad per lamp, all in a single additive draw call.
 * They only add light (no depth write, no shadows, no lighting maths), so they cost a phone next to nothing.
 */
export class LightPoolFactory {
  constructor(
    private readonly radius: number,
    private readonly lift: number,
    private readonly color: number,
  ) {}

  /** `centres` are world-space points on the ground. */
  create(centres: readonly Vec3[]): LightPools {
    const strength = { value: 0 };
    const material = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(this.color) }, uStrength: strength },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const quad = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const object = new THREE.InstancedMesh(quad, material, centres.length);
    object.name = 'street-light-pools';
    const size = this.radius * 2;
    const matrix = new THREE.Matrix4();
    centres.forEach((centre, i) => {
      matrix.makeScale(size, 1, size).setPosition(centre.x, centre.y + this.lift, centre.z);
      object.setMatrixAt(i, matrix);
    });
    object.instanceMatrix.needsUpdate = true;
    object.computeBoundingSphere();
    object.castShadow = false;
    object.receiveShadow = false;
    object.visible = false;
    return { object, strength };
  }
}
