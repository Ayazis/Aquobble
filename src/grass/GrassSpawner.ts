import { identityQuat, vec3, type GameWorld, type Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import type { Object3D } from 'three';
import type {} from '@rendering';
import type { FlowerInstancesFactory } from './FlowerInstancesFactory';
import type { GrassInstancesFactory } from './GrassInstancesFactory';
import { GrassPlacer, type FlowerPlacerOptions, type GrassPlacerOptions } from './GrassPlacer';
import type { WindSway } from './WindSway';

export interface GrassOptions {
  grass: GrassPlacerOptions;
  flowers: FlowerPlacerOptions;
  /** Height above the water level where grass starts (keeps beaches bare). */
  beachMargin: number;
  maxHeight: number;
  /** Max slope as rise over run. */
  maxSlope: number;
}

/** Places grass and flowers and adds each as a swaying render entity. */
export class GrassSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly ground: HeightSampler,
    private readonly random: Random,
    private readonly grass: GrassInstancesFactory,
    private readonly flowers: FlowerInstancesFactory,
  ) {}

  spawn(options: GrassOptions, waterLevel: number, exclude: readonly ExclusionZone[] = []): void {
    const rules = {
      minHeight: waterLevel + options.beachMargin,
      maxHeight: options.maxHeight,
      maxSlope: options.maxSlope,
      exclude,
    };
    const placer = new GrassPlacer(this.ground, this.random, rules);
    const windSway: WindSway = { time: { value: 0 } };
    this.add(this.grass.create(placer.grass(options.grass), windSway), windSway);
    this.add(this.flowers.create(placer.flowers(options.flowers), windSway), windSway);
  }

  private add(object: Object3D, windSway: WindSway): void {
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      renderObject: { object },
      windSway,
    });
  }
}
