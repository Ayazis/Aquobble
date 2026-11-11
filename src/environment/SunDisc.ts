import * as THREE from 'three';
import type { Vec3 } from '@core';
import { glowTexture } from './glowTexture';
import { sunGlow } from './sunGlow';

const RADIUS = 860;
const SIZE = 30;
/**
 * Disc brightness before tone mapping. Bright enough to read as the brightest thing on screen, but under
 * the bloom threshold (6), so bloom never smears it over the frame again.
 */
const CORE = 3.5;
/** The halo is drawn, not bloomed: wide and faint, so it reads the same on phones (which skip bloom). */
const HALO = 0.35;
const HALO_SIZE = SIZE * 6;

/** Our own sun: a crisp disc with a small soft halo, tinted by the hour's sun colour. */
export class SunDisc {
  readonly group = new THREE.Group();
  private readonly disc: THREE.Sprite;
  private readonly halo: THREE.Sprite;
  private readonly tint = new THREE.Color();

  constructor() {
    this.disc = this.sprite(glowTexture(0.82), SIZE);
    this.halo = this.sprite(glowTexture(0.02), HALO_SIZE);
    this.group.add(this.halo, this.disc);
    this.group.renderOrder = -1;
  }

  /** `sunDir` is the unit direction to the sun, `sunColor` 0xRRGGBB, `center` the viewer. */
  update(sunDir: Vec3, sunColor: number, center: Vec3): void {
    const strength = sunGlow(sunDir.y);
    this.group.visible = strength > 0.001;
    if (!this.group.visible) return;
    this.group.position.set(center.x, center.y, center.z);
    this.disc.position.set(sunDir.x * RADIUS, sunDir.y * RADIUS, sunDir.z * RADIUS);
    this.halo.position.copy(this.disc.position);
    // The core stays near white; only the low sun turns warm. The halo carries more of the colour.
    this.tint.setHex(sunColor).lerp(WHITE, 0.6);
    this.disc.material.color.copy(this.tint).multiplyScalar(CORE * strength);
    this.halo.material.color.setHex(sunColor).multiplyScalar(HALO * strength);
  }

  private sprite(texture: THREE.Texture, scale: number): THREE.Sprite {
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      fog: false,
      blending: THREE.AdditiveBlending,
    });
    const s = new THREE.Sprite(material);
    s.scale.setScalar(scale);
    return s;
  }
}

const WHITE = new THREE.Color(1, 1, 1);
