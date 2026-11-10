import * as THREE from 'three';
import type { Vec3 } from '@core';
import { CLOUD_FRAGMENT, CLOUD_VERTEX } from './cloudShader';

const ALTITUDE = 240;
const SIZE = 5000;

/** A high sheet of soft, drifting noise clouds, tinted by the time of day. */
export class CloudLayer {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private readonly tint = new THREE.Color();
  private readonly glow = new THREE.Color();
  private elapsed = 0;

  constructor() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        tint: { value: new THREE.Color(1, 1, 1) },
        glow: { value: new THREE.Color(1, 1, 1) },
        sunDir: { value: new THREE.Vector3(0, 1, 0) },
        fadeRadius: { value: SIZE * 0.42 },
      },
      vertexShader: CLOUD_VERTEX,
      fragmentShader: CLOUD_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = ALTITUDE;
    this.mesh.frustumCulled = false;
  }

  /**
   * `base` is the haze colour the clouds sit in, `light` the key light colour and `brightness` its strength
   * (0 = night, 1 = noon). `sun` is the unit direction towards the sun; `center` keeps the sheet over the viewer.
   */
  update(dt: number, base: number, light: number, brightness: number, sun: Vec3, center: Vec3): void {
    this.elapsed += dt;
    const uniforms = this.mesh.material.uniforms;
    uniforms.time.value = this.elapsed;
    // Body of the cloud: haze colour lifted towards white by day, left dark at night.
    this.tint.setHex(base).lerp(this.glow.setRGB(1, 1, 1), 0.85 * brightness);
    (uniforms.tint.value as THREE.Color).copy(this.tint).multiplyScalar(0.35 + 1.5 * brightness);
    // Sun-facing rim: the key light colour, strongest at dawn and dusk when it is most saturated.
    (uniforms.glow.value as THREE.Color).setHex(light).multiplyScalar(0.2 + 1.6 * brightness);
    (uniforms.sunDir.value as THREE.Vector3).set(sun.x, sun.y, sun.z);
    this.mesh.position.set(center.x, ALTITUDE, center.z);
  }
}
