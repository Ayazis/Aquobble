import * as THREE from 'three';
import type { Random, Vec3 } from '@core';
import { StarFieldFactory } from './StarFieldFactory';

const RADIUS = 900;
const MOON_SIZE = 56;

/** Draws a soft round glow into a canvas, used for the moon disc and its halo. */
function glowTexture(core: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(core, 'rgba(255,255,255,1)');
  g.addColorStop(Math.min(1, core + 0.04), 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function sprite(texture: THREE.Texture, color: number, scale: number): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending,
  });
  const s = new THREE.Sprite(material);
  s.scale.setScalar(scale);
  return s;
}

/** Stars and a glowing moon disc that fade in as the sun goes down. */
export class NightSky {
  readonly group = new THREE.Group();
  private readonly stars: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly moon: THREE.Sprite;
  private readonly halo: THREE.Sprite;
  private elapsed = 0;

  constructor(random: Random) {
    this.stars = new StarFieldFactory(random).create(2500, RADIUS);
    this.moon = sprite(glowTexture(0.42), 0xfffdf2, MOON_SIZE);
    this.halo = sprite(glowTexture(0.02), 0xa9c0f0, MOON_SIZE * 7);
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
