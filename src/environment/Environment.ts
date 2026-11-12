import * as THREE from 'three';
import type { CloudShadow, ColorGrade, LightShafts, RenderContext } from '@rendering';
import { installHeightFog } from './heightFogChunk'; // lane D2
import { Atmosphere } from './Atmosphere';
import { DayNightSystem } from './DayNightSystem';
import type { DayKeyframe } from './DayKeyframe';
import { DEFAULT_DAY_KEYFRAMES } from './dayKeyframes';
import type { EnvironmentConfig } from './EnvironmentConfig';
import type { Random } from '@core';
import { NightSky } from './NightSky';
import { SkyDome } from './SkyDome';
import { SunLight } from './SunLight';

/** Installs the sky (atmosphere, clouds, sun, moon, stars), fog and image-based lighting into the scene. */
export class Environment {
  /** The sun/moon and its fill light, once `install` has run (lane D: light). */
  sunLight?: SunLight;

  constructor(
    private readonly config: EnvironmentConfig,
    private readonly keyframes: readonly DayKeyframe[] = DEFAULT_DAY_KEYFRAMES,
  ) {}

  /**
   * Adds the atmosphere to the scene and returns the frame system that animates it through the day.
   * `grade`, when given, follows the hour too (calmer colour at night). `cloudShadow`, from
   * `installSceneLighting`, lets the drifting clouds shade the ground.
   */
  install(
    context: RenderContext,
    random: Random,
    grade?: ColorGrade & Partial<LightShafts>,
    cloudShadow?: CloudShadow,
  ): DayNightSystem {
    const { scene, renderer, camera } = context;
    const night = new NightSky(random);
    const sky = new SkyDome(new Atmosphere(), context.quality.sky);
    // lane D: light. Cascaded sun shadows (two boxes on desktop, one on phones).
    const { shadows, shadowMapSize, shadowBoxSize, farShadowBoxSize, shadowCascades } = context.quality;
    const mapSize = shadows ? shadowMapSize : 512;
    const light = new SunLight({ nearBox: shadowBoxSize, farBox: farShadowBoxSize, mapSize, cascades: shadowCascades });
    this.sunLight = light;
    // end lane D
    installHeightFog(); // lane D2: fog pools in valleys and over the sea
    const fog = new THREE.FogExp2(0xffffff, 0);

    scene.add(sky.sky, night.group, sky.clouds, ...light.objects);
    scene.fog = fog;
    const parts = { renderer, scene, fog, sky, light, night, camera, grade, cloudShadow };
    const dayNight = new DayNightSystem(parts, this.keyframes, this.config);
    dayNight.update(0); // apply the start time before the first frame
    return dayNight;
  }
}
