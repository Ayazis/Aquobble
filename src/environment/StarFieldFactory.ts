import * as THREE from 'three';
import type { Random } from '@core';

const VERTEX = /* glsl */ `
  attribute float size;
  attribute float phase;
  uniform float time;
  uniform float opacity;
  varying float vAlpha;
  void main() {
    float twinkle = 0.75 + 0.25 * sin(time * (1.5 + phase) + phase * 6.2831);
    vAlpha = opacity * twinkle;
    gl_PointSize = size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    gl_FragColor = vec4(vec3(1.0, 0.97, 0.92), a * a * vAlpha);
  }
`;

/** Builds a dome of twinkling stars on a sphere of `radius`, upper hemisphere plus a little below. */
export class StarFieldFactory {
  constructor(private readonly random: Random) {}

  create(count: number, radius: number): THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const y = this.random.next() * 1.1 - 0.1;
      const angle = this.random.next() * Math.PI * 2;
      const ring = Math.sqrt(1 - y * y);
      positions.set([Math.cos(angle) * ring * radius, y * radius, Math.sin(angle) * ring * radius], i * 3);
      const bright = this.random.next();
      sizes[i] = 1.5 + bright * bright * bright * 3.5;
      phases[i] = this.random.next();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { time: { value: 0 }, opacity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }
}
