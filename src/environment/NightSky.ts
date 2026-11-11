import * as THREE from 'three';
import type { Random, Vec3 } from '@core';
import { glowTexture } from './glowTexture';
import { moonFaceTexture } from './moonFaceTexture';
import { moonMaria } from './moonMaria';
import { StarFieldFactory } from './StarFieldFactory';

const RADIUS = 900;
const MOON_SIZE = 34;
const MOON_BRIGHTNESS = 1.6;

function sprite(texture: THREE.Texture, color: THREE.Color, scale: number, blending: THREE.Blending): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    depthWrite: false,
    fog: false,
    blending,
  });
  const s = new THREE.Sprite(material);
  s.scale.setScalar(scale);
  return s;
}

/** Stars, a moon with a painted face and its soft halo, all fading in as the sun goes down. */
export class NightSky {
  readonly group = new THREE.Group();
  private readonly stars: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly moon: THREE.Sprite;
  private readonly halo: THREE.Sprite;
  private elapsed = 0;

  constructor(random: Random) {
    this.stars = new StarFieldFactory(random).create(2500, RADIUS);
    // Drawn over the sky (not added), so stars do not shine through it; bright, but well under the bloom threshold.
    const face = moonFaceTexture(moonMaria(random));
    this.moon = sprite(
      face,
      new THREE.Color(0xfffdf2).multiplyScalar(MOON_BRIGHTNESS),
      MOON_SIZE,
      THREE.NormalBlending,
    );
    this.halo = sprite(glowTexture(0.02), new THREE.Color(0xa9c0f0), MOON_SIZE * 9, THREE.AdditiveBlending);
    this.moon.renderOrder = 1;
    this.group.add(this.stars, this.halo, this.moon);
    this.group.renderOrder = -1;
  }

  /**
   * `night` in [0, 1] (0 = day, 1 = full night); `moonDir` is the unit direction towards the moon.
   * `dt` drives the twinkle; `center` keeps the dome around the viewer.
   */
  update(dt: number, night: number, moonDir: Vec3, center: Vec3): void {
    this.elapsed += dt;
    this.group.visible = night > 0.001;
    this.group.position.set(center.x, 0, center.z);
    const uniforms = this.stars.material.uniforms;
    uniforms.time.value = this.elapsed;
    uniforms.opacity.value = night;
    const moonUp = Math.min(1, Math.max(0, (moonDir.y + 0.02) / 0.1));
    this.moon.material.opacity = night * moonUp;
    this.halo.material.opacity = night * moonUp * 0.7;
    const d = RADIUS * 0.95;
    this.moon.position.set(moonDir.x * d, moonDir.y * d, moonDir.z * d);
    this.halo.position.copy(this.moon.position);
  }
}
