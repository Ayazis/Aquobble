import * as THREE from 'three';
import type { Vec3 } from '@core';
import { snapToShadowTexels } from './snapToShadowTexels';

const LIGHT_DISTANCE = 150;
/** How far ahead of the camera, as a share of the box width, the shadow box is centred. */
const LOOK_AHEAD = 0.3;

/** Directional sun (or moon) with crisp shadows in a box that follows the view, plus sky/ground fill light. */
export class SunLight {
  readonly sun = new THREE.DirectionalLight(0xffffff, 1);
  readonly fill = new THREE.HemisphereLight(0xbfd8ff, 0x3a2f24, 0.6);
  private readonly direction = new THREE.Vector3(0, 1, 0);
  private readonly forward = new THREE.Vector3();

  /** `shadowBoxSize` is the width in metres of the square shadow box; `shadowMapSize` its resolution. */
  constructor(
    private readonly shadowBoxSize = 40,
    private readonly shadowMapSize = 4096,
  ) {
    const half = shadowBoxSize / 2;
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    Object.assign(this.sun.shadow.camera, {
      left: -half,
      right: half,
      top: half,
      bottom: -half,
      near: 10,
      far: LIGHT_DISTANCE * 2,
    });
    this.sun.shadow.camera.updateProjectionMatrix();
    this.sun.shadow.bias = -0.0002;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.radius = 2;
  }

  /** Points the light from `direction` (unit vector towards the light). Call `follow` after it. */
  setDirection(direction: Vec3): void {
    this.direction.set(direction.x, direction.y, direction.z);
  }

  /** Centres the shadow box a little ahead of `camera`, snapped to whole shadow-map texels. */
  follow(camera: THREE.Camera): void {
    camera.getWorldDirection(this.forward).setY(0);
    if (this.forward.lengthSq() > 1e-6) this.forward.normalize();
    const focus = this.forward.multiplyScalar(this.shadowBoxSize * LOOK_AHEAD).add(camera.position);
    const center = snapToShadowTexels(focus, this.direction, this.shadowBoxSize, this.shadowMapSize);
    this.sun.target.position.set(center.x, center.y, center.z);
    this.sun.target.updateMatrixWorld();
    this.sun.position.copy(this.direction).multiplyScalar(LIGHT_DISTANCE).add(this.sun.target.position);
  }
}
