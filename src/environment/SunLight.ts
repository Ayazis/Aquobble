import * as THREE from 'three';
import type { Vec3 } from '@core';
import { snapToShadowTexels } from './snapToShadowTexels';

const LIGHT_DISTANCE = 150;
/** How far ahead of the camera, as a share of the box width, the shadow box is centred. */
const LOOK_AHEAD = 0.3;
/** The far cascade's map: its box is wide, so a full-size map and a blur close to the near one keep the hand-over invisible. */
const FAR_MAP_SIZE = 4096;

/** Shadow layout: one sharp box near the camera, plus an optional wide soft one out to the horizon. */
export interface SunShadowOptions {
  /** Width in metres of the near (sharp) box. */
  nearBox: number;
  /** Width in metres of the far (soft) box; used when `cascades` is 2. */
  farBox: number;
  mapSize: number;
  /** 1 on phones, 2 on desktops. */
  cascades: number;
}

/**
 * Directional sun (or moon) with cascaded shadows in boxes that follow the view, plus sky/ground fill light.
 * The far cascade is a second, unlit directional light that only casts: `installToonLighting` reads its
 * shadow map for light 0 wherever the near box ends, so far trees and the town keep their shadows.
 */
export class SunLight {
  readonly sun = new THREE.DirectionalLight(0xffffff, 1);
  readonly fill = new THREE.HemisphereLight(0xbfd8ff, 0x3a2f24, 0.6);
  /** Shadow-only light for the far cascade; absent with one cascade. */
  readonly farCascade?: THREE.DirectionalLight;
  private readonly direction = new THREE.Vector3(0, 1, 0);
  private readonly forward = new THREE.Vector3();

  constructor(private readonly options: SunShadowOptions = { nearBox: 40, farBox: 120, mapSize: 4096, cascades: 1 }) {
    configureShadow(this.sun, options.nearBox, options.mapSize, 1.5);
    if (options.cascades > 1) {
      this.farCascade = new THREE.DirectionalLight(0x000000, 0);
      configureShadow(this.farCascade, options.farBox, FAR_MAP_SIZE, 2.5);
      this.farCascade.shadow.normalBias = 0.05;
    }
  }

  /** Every object to add to the scene (the sun first: the shader expects it as directional light 0). */
  get objects(): THREE.Object3D[] {
    return [this.sun, this.fill, ...(this.farCascade ? [this.farCascade] : [])];
  }

  /** Points the light from `direction` (unit vector towards the light). Call `follow` after it. */
  setDirection(direction: Vec3): void {
    this.direction.set(direction.x, direction.y, direction.z);
  }

  /** Centres each shadow box a little ahead of `camera`, snapped to whole shadow-map texels. */
  follow(camera: THREE.Camera): void {
    camera.getWorldDirection(this.forward).setY(0);
    if (this.forward.lengthSq() > 1e-6) this.forward.normalize();
    this.place(this.sun, camera, this.options.nearBox, this.options.mapSize);
    if (this.farCascade) this.place(this.farCascade, camera, this.options.farBox, FAR_MAP_SIZE);
  }

  private place(light: THREE.DirectionalLight, camera: THREE.Camera, box: number, mapSize: number): void {
    const focus = this.forward
      .clone()
      .multiplyScalar(box * LOOK_AHEAD)
      .add(camera.position);
    const center = snapToShadowTexels(focus, this.direction, box, mapSize);
    light.target.position.set(center.x, center.y, center.z);
    light.target.updateMatrixWorld();
    light.position.copy(this.direction).multiplyScalar(LIGHT_DISTANCE).add(light.target.position);
  }
}

function configureShadow(light: THREE.DirectionalLight, box: number, mapSize: number, radius: number): void {
  const half = box / 2;
  light.castShadow = true;
  light.shadow.mapSize.set(mapSize, mapSize);
  Object.assign(light.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10 });
  light.shadow.camera.far = LIGHT_DISTANCE * 2;
  light.shadow.camera.updateProjectionMatrix();
  light.shadow.bias = -0.0002;
  light.shadow.normalBias = 0.03;
  // PCF in three r187 samples a rotated Vogel (poisson-like) disk: radius sets how soft the edge is.
  light.shadow.radius = radius;
}
