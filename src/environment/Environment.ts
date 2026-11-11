import * as THREE from 'three';
import type { CloudShadow, ColorGrade, RenderContext } from '@rendering';
import { CloudLayer } from './CloudLayer';
import { DayNightSystem } from './DayNightSystem';
import type { DayKeyframe } from './DayKeyframe';
import { DEFAULT_DAY_KEYFRAMES } from './dayKeyframes';
import type { EnvironmentConfig } from './EnvironmentConfig';
import type { Random } from '@core';
import { NightSky } from './NightSky';
import { SkyDome } from './SkyDome';
import { SunDisc } from './SunDisc';
import { SunLight } from './SunLight';

/** Installs sky, sun, moon, stars, fog and image-based lighting into the scene. */
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
   * `installToonLighting`, lets the drifting clouds shade the ground.
   */
  install(context: RenderContext, random: Random, grade?: ColorGrade, cloudShadow?: CloudShadow): DayNightSystem {
    const { scene, renderer, camera } = context;
    const night = new NightSky(random);
    const sky = new SkyDome();
    const clouds = new CloudLayer(cloudShadow);
    const sunDisc = new SunDisc();
    // lane D: light. Cascaded sun shadows (two boxes on desktop, one on phones).
    const { shadows, shadowMapSize, shadowBoxSize, farShadowBoxSize, shadowCascades } = context.quality;
    const mapSize = shadows ? shadowMapSize : 512;
    const light = new SunLight({ nearBox: shadowBoxSize, farBox: farShadowBoxSize, mapSize, cascades: shadowCascades });
    this.sunLight = light;
    // end lane D
    const fog = new THREE.FogExp2(0xffffff, 0);

    scene.add(sky.sky, sunDisc.group, night.group, clouds.mesh, ...light.objects);
    scene.fog = fog;
    const dayNight = new DayNightSystem(
      renderer,
      scene,
      fog,
      sky,
      light,
      this.keyframes,
      this.config,
      night,
      camera,
      clouds,
      sunDisc,
      grade,
    );
    dayNight.update(0); // apply the start time before the first frame
    return dayNight;
  }
}
