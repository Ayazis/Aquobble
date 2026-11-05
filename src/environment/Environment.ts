import * as THREE from 'three';
import type { RenderContext } from '@rendering';
import { DayNightSystem } from './DayNightSystem';
import type { DayKeyframe } from './DayKeyframe';
import { DEFAULT_DAY_KEYFRAMES } from './dayKeyframes';
import type { EnvironmentConfig } from './EnvironmentConfig';
import { SkyDome } from './SkyDome';
import { SunLight } from './SunLight';

/** Installs sky, sun, fog and image-based lighting into the scene. */
export class Environment {
  constructor(
    private readonly config: EnvironmentConfig,
    private readonly keyframes: readonly DayKeyframe[] = DEFAULT_DAY_KEYFRAMES,
  ) {}

  /** Adds the atmosphere to the scene and returns the frame system that animates it through the day. */
  install(context: RenderContext): DayNightSystem {
    const { scene, renderer } = context;
    const sky = new SkyDome();
    const light = new SunLight();
    const fog = new THREE.FogExp2(0xffffff, 0);

    scene.add(sky.sky, light.sun, light.fill);
    scene.fog = fog;
    const dayNight = new DayNightSystem(renderer, scene, fog, sky, light, this.keyframes, this.config);
    dayNight.update(0); // apply the start time before the first frame
    return dayNight;
  }
}
