import * as THREE from 'three';
import type { Vec3 } from '@core';
import { Atmosphere } from './Atmosphere';
import { CloudMap } from './CloudMap';
import { CLOUD_DOME_FRAGMENT, SKY_DOME_VERTEX, skyDomeFragment } from './skyDomeShader';
import type { SkyLighting } from './skyLighting';
import { createSkyUniforms } from './SkyUniforms';

/** Quality of the cloud map: texels per side and march steps per ray. */
export interface SkyDetail {
  cloudMapSize: number;
  cloudSteps: number;
}

/**
 * The physically based sky: a dome shaded by the atmosphere model (with the sun's disc), and over it the
 * volumetric clouds from the cloud map. An environment map is baked from both, so the sky lights the scene.
 */
export class SkyDome {
  /** Add both to the scene: the clear sky, and the clouds that go over the stars and the sun. */
  readonly sky: THREE.Mesh;
  readonly clouds: THREE.Mesh;
  readonly uniforms = createSkyUniforms();
  private readonly cloudMap: CloudMap;
  private readonly envScene = new THREE.Scene();
  private pmrem?: THREE.PMREMGenerator;
  private envMap?: THREE.Texture;

  constructor(
    readonly atmosphere = new Atmosphere(),
    detail: SkyDetail = { cloudMapSize: 1024, cloudSteps: 22 },
  ) {
    this.cloudMap = new CloudMap(this.uniforms, detail.cloudMapSize, detail.cloudSteps);
    this.uniforms.uCloudMap.value = this.cloudMap.texture;
    this.uniforms.uCloudTexel.value = 1 / detail.cloudMapSize;
    this.uniforms.uMieG.value = atmosphere.options.mieG;
    const geometry = new THREE.SphereGeometry(1000, 32, 16);
    this.sky = this.dome(geometry, skyDomeFragment(true), -3, false);
    this.clouds = this.dome(geometry, CLOUD_DOME_FRAGMENT, -1, true);
    // The bake leaves the sun's disc out: the sun light already gives the highlights.
    this.envScene.add(this.dome(geometry, skyDomeFragment(false), -3, false), this.clouds.clone());
  }

  /** Sets the sky for this frame. `cloudTime` is the cloud clock (s), `camera` the viewer. */
  update(sun: Vec3, light: SkyLighting, overcast: number, cloudTime: number, camera: Vec3): void {
    const u = this.uniforms;
    const { betaR, betaM } = this.atmosphere.coefficients(sun.y, overcast);
    u.uSunDir.value.set(sun.x, sun.y, sun.z);
    u.uBetaR.value.fromArray(betaR);
    u.uBetaM.value.fromArray(betaM);
    u.uSunE.value = 1000 * this.atmosphere.sunStrength(sun.y);
    u.uSunDisc.value.fromArray(light.sunDisc);
    u.uNightZenith.value.fromArray(light.nightZenith);
    u.uNightHorizon.value.fromArray(light.nightHorizon);
    u.uSkyNight.value.fromArray(light.nightHorizon);
    u.uTwilight.value.fromArray(light.twilight);
    u.uCloudCam.value.set(camera.x, camera.y, camera.z);
    u.uCloudTime.value = cloudTime;
    u.uCloudCover.value = 0.2 * overcast;
    u.uCloudLightDir.value.set(light.lightDir.x, light.lightDir.y, light.lightDir.z);
    u.uCloudLight.value.fromArray(light.key);
    u.uCloudAmbient.value.fromArray(light.ambient);
  }

  /** Draws the next band of the cloud map; call once a frame after `update`. */
  drawClouds(renderer: THREE.WebGLRenderer, camera: Vec3): void {
    this.cloudMap.update(renderer, camera);
  }

  /** The light jumped (time of day set by hand): redraw the whole cloud map on the next frame. */
  invalidate(): void {
    this.cloudMap.invalidate();
  }

  /** Re-bakes the environment map from the current sky and disposes the previous one. */
  bakeEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
    this.pmrem ??= new THREE.PMREMGenerator(renderer);
    const texture = this.pmrem.fromScene(this.envScene, 0, 0.1, 100, { size: 128 }).texture;
    this.envMap?.dispose();
    this.envMap = texture;
    return texture;
  }

  private dome(geometry: THREE.BufferGeometry, fragment: string, order: number, blend: boolean): THREE.Mesh {
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms as unknown as Record<string, THREE.IUniform>,
      vertexShader: SKY_DOME_VERTEX,
      fragmentShader: fragment,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      transparent: blend,
      // Premultiplied: the map's rgb is already weighted by its coverage.
      ...(blend ? { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor } : {}),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = order;
    return mesh;
  }
}
