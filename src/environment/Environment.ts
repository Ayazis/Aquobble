import * as THREE from 'three';
import type { RenderContext } from '@rendering';
import { DayNightSystem } from './DayNightSystem';
import type { DayKeyframe } from './DayKeyframe';
import { DEFAULT_DAY_KEYFRAMES } from './dayKeyframes';
import type { EnvironmentConfig } from './EnvironmentConfig';
import type { Random } from '@core';
import { NightSky } from './NightSky';
import { SkyDome } from './SkyDome';
import { SunLight } from './SunLight';

/** Installs sky, sun, moon, stars, fog and image-based lighting into the scene. */
export class Environment {
  constructor(
    private readonly config: EnvironmentConfig,
    private readonly keyframes: readonly DayKeyframe[] = DEFAULT_DAY_KEYFRAMES,
  ) {}

  /** Adds the atmosphere to the scene and returns the frame system that animates it through the day. */
  install(context: RenderContext, random: Random): DayNightSystem {
    const { scene, renderer, camera } = context;
    const night = new NightSky(random);
    const sky = new SkyDome();
    const light = new SunLight(undefined, context.quality.shadows ? context.quality.shadowMapSize : 512);
    const fog = new THREE.FogExp2(0xffffff, 0);

    scene.add(sky.sky, night.group, light.sun, light.fill);
    scene.fog = fog;
    const dayNight = new DayNightSystem(renderer, scene, fog, sky, light, this.keyframes, this.config, night, camera);
    dayNight.update(0); // apply the start time before the first frame
    return dayNight;
  }
}
