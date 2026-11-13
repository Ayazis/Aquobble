import type * as THREE from 'three';
import type { System, Vec3 } from '@core';
import type { CloudShadow, ColorGrade, LightShafts } from '@rendering';
import { HeightFog } from './HeightFog'; // lane D2
import { lightShaftStrength } from './lightShaftStrength'; // lane D2
import type { NightSky } from './NightSky';
import type { DayKeyframe } from './DayKeyframe';
import type { EnvironmentConfig } from './EnvironmentConfig';
import { adaptedExposure } from './adaptedExposure';
import { luma, scale3 } from './rgb';
import { sampleDayCycle } from './sampleDayCycle';
import type { SkyDome } from './SkyDome';
import { skyLighting } from './skyLighting';
import { sunDirectionAt } from './sunDirectionAt';
import type { SunLight } from './SunLight';

/** How much of the sun a cloud takes away on the ground beneath it. */
const CLOUD_SHADOW = 0.82;

/** The scene objects the day cycle drives. */
export interface DayNightParts {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  fog: THREE.FogExp2;
  sky: SkyDome;
  light: SunLight;
  night: NightSky;
  camera: THREE.Camera;
  grade?: ColorGrade & Partial<LightShafts>;
  cloudShadow?: CloudShadow;
}

/** Frame system: advances the time of day and drives sun, moon, sky, clouds, fog and fill light from it. */
export class DayNightSystem implements System {
  private time: number;
  private sinceBake = Infinity;
  private elapsed = 0;
  /** True stops the clock (debug and screenshots); the lighting still follows `setTimeOfDay`. */
  paused = false;
  /** Lane D2: live fog controls (weather sets `heightFog.mist`). */
  readonly heightFog = new HeightFog();
  /** Lane G: weather. 0..1 grey sky: thickens the clouds, dims the sun and washes the colours out. */
  overcast = 0;
  private readonly noon: number;
  private lightDir: Vec3 = { x: 0, y: 1, z: 0 };
  private darkness = 0;

  constructor(
    private readonly parts: DayNightParts,
    private readonly keyframes: readonly DayKeyframe[],
    private readonly config: EnvironmentConfig,
  ) {
    this.time = config.startTimeOfDay;
    const noonSun = sunDirectionAt(0.5, config.sunAzimuth, config.noonSunElevation);
    this.noon = skyLighting(parts.sky.atmosphere, noonSun).brightness;
  }

  /** Current time of day in [0, 1). */
  get timeOfDay(): number {
    return this.time;
  }

  /** Jumps to a time of day in [0, 1) and re-bakes the sky lighting on the next frame. */
  setTimeOfDay(time: number): void {
    this.time = ((time % 1) + 1) % 1;
    this.sinceBake = Infinity;
    this.parts.sky.invalidate();
  }

  /** Unit direction towards the current key light (sun by day, moon by night). */
  get lightDirection(): Vec3 {
    return this.lightDir;
  }

  /** How dark the sky is in [0, 1]: 0 by day, 1 at full night (stars and moon fully out). */
  get nightAmount(): number {
    return this.darkness;
  }

  update(dt: number): void {
    const { dayLengthSeconds, sunAzimuth, noonSunElevation, environmentRefreshSeconds } = this.config;
    const { renderer, scene, fog, sky, light, night, camera, grade, cloudShadow } = this.parts;
    if (dayLengthSeconds > 0 && !this.paused) this.time = (this.time + dt / dayLengthSeconds) % 1;
    this.elapsed += dt;

    const art = sampleDayCycle(this.keyframes, this.time);
    const sun = sunDirectionAt(this.time, sunAzimuth, noonSunElevation);
    const lit = skyLighting(sky.atmosphere, sun, this.overcast);
    this.lightDir = lit.lightDir;
    this.darkness = lit.night;

    light.setDirection(lit.lightDir);
    light.follow(camera);
    light.sun.color.fromArray(lit.key);
    light.sun.intensity = art.sunIntensity;
    light.fill.color.fromArray(lit.fill);
    light.fill.groundColor.fromArray(lit.bounce);
    light.fill.intensity = art.hemisphereIntensity;
    fog.color.fromArray(lit.fog);
    fog.density = this.heightFog.densityFor(art.fogDensity) * (1 + 0.8 * this.overcast); // lane D2
    renderer.toneMappingExposure = adaptedExposure(art.exposure, lit.brightness, this.noon, lit.night);
    scene.environmentIntensity = art.environmentIntensity;
    grade?.setGrade(art.gradeSaturation * (1 - 0.25 * this.overcast), art.gradeContrast, art.gradeLift); // lane G

    const peak = Math.max(lit.key[0], lit.key[1], lit.key[2], 1e-4);
    const shafts = lightShaftStrength(sun.y) * Math.min(1, luma(lit.key)) * (1 - this.overcast);
    grade?.setLightShafts?.(sun, scale3(lit.key, 1 / peak), shafts); // lane D2
    night.update(dt, lit.night, { x: -sun.x, y: -sun.y, z: -sun.z }, camera.position);
    sky.update(sun, lit, this.overcast, this.elapsed, camera.position);
    sky.drawClouds(renderer, camera.position);
    // Fades out with the daylight, so there are no cloud shadows at night.
    cloudShadow?.set(this.elapsed, sun, CLOUD_SHADOW * (1 - lit.night), 0.2 * this.overcast);

    this.sinceBake += dt;
    if (this.sinceBake >= environmentRefreshSeconds) {
      this.sinceBake = 0;
      scene.environment = sky.bakeEnvironmentMap(renderer);
    }
  }
}
