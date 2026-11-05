import * as THREE from 'three';
import type { RenderContext } from '@rendering';
import type { EnvironmentConfig } from './EnvironmentConfig';
import { SkyDome } from './SkyDome';
import { SunLight } from './SunLight';

/** Installs sky, sun, fog and image-based lighting into the scene. */
export class Environment {
  constructor(private readonly config: EnvironmentConfig) {}

  install(context: RenderContext): void {
    const { scene, renderer } = context;
    const direction = this.sunDirection();
    const sky = new SkyDome(direction);
    const light = new SunLight(direction, this.config.sunColor, this.config.sunIntensity);

    scene.add(sky.sky, light.sun, light.fill);
    scene.environment = sky.createEnvironmentMap(renderer);
    scene.environmentIntensity = this.config.environmentIntensity;
    scene.fog = new THREE.FogExp2(this.config.fogColor, this.config.fogDensity);
  }

  private sunDirection(): THREE.Vector3 {
    const { degToRad } = THREE.MathUtils;
    return new THREE.Vector3().setFromSphericalCoords(
      1,
      degToRad(this.config.sunElevationFromZenith),
      degToRad(this.config.sunAzimuth),
    );
  }
}
