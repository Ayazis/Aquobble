import type * as THREE from 'three';
import type { System, Vec3 } from '@core';
import type { DayKeyframe } from './DayKeyframe';
import type { EnvironmentConfig } from './EnvironmentConfig';
import { sampleDayCycle } from './sampleDayCycle';
import type { SkyDome } from './SkyDome';
import { sunDirectionAt } from './sunDirectionAt';
import type { SunLight } from './SunLight';

/** Height (direction y) over which the light fades out near the horizon while sun and moon swap. */
const HORIZON_FADE = 0.08;

/** Frame system: advances the time of day and drives sun, moon, sky, fog and fill light from keyframes. */
export class DayNightSystem implements System {
  private time: number;
  private sinceBake = Infinity;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly fog: THREE.FogExp2,
    private readonly sky: SkyDome,
    private readonly light: SunLight,
    private readonly keyframes: readonly DayKeyframe[],
    private readonly config: EnvironmentConfig,
  ) {
    this.time = config.startTimeOfDay;
  }

  /** Current time of day in [0, 1). */
  get timeOfDay(): number {
    return this.time;
  }

  /** Unit direction towards the current key light (sun by day, moon by night). */
  get lightDirection(): Vec3 {
    return this.lightDir;
  }

  private lightDir: Vec3 = { x: 0, y: 1, z: 0 };

  update(dt: number): void {
    const { dayLengthSeconds, sunAzimuth, noonSunElevation, environmentRefreshSeconds } = this.config;
    if (dayLengthSeconds > 0) this.time = (this.time + dt / dayLengthSeconds) % 1;

    const lighting = sampleDayCycle(this.keyframes, this.time);
    const sun = sunDirectionAt(this.time, sunAzimuth, noonSunElevation);
    // Below the horizon the moon takes over from the opposite side of the sky.
    const lightDir = sun.y >= 0 ? sun : { x: -sun.x, y: -sun.y, z: -sun.z };
    const fade = Math.min(1, Math.abs(sun.y) / HORIZON_FADE);

    this.lightDir = lightDir;
    this.light.setDirection(lightDir);
    this.light.sun.color.setHex(lighting.sunColor);
    this.light.sun.intensity = lighting.sunIntensity * fade;
    this.light.fill.color.setHex(lighting.hemisphereSky);
    this.light.fill.groundColor.setHex(lighting.hemisphereGround);
    this.light.fill.intensity = lighting.hemisphereIntensity;
    this.fog.color.setHex(lighting.fogColor);
    this.fog.density = lighting.fogDensity;
    this.renderer.toneMappingExposure = lighting.exposure;
    this.scene.environmentIntensity = lighting.environmentIntensity;
    this.sky.setSun(sun, lighting.turbidity, lighting.rayleigh);

    this.sinceBake += dt;
    if (this.sinceBake >= environmentRefreshSeconds) {
      this.sinceBake = 0;
      this.scene.environment = this.sky.bakeEnvironmentMap(this.renderer);
    }
  }
}
