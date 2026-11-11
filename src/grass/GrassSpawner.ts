import { identityQuat, vec3, type GameWorld, type Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import type { Object3D } from 'three';
import type {} from '@rendering';
import type { FlowerInstancesFactory } from './FlowerInstancesFactory';
import type { GrassBlocker } from './GrassBlocker';
import type { GrassInstancesFactory } from './GrassInstancesFactory';
import type { GroundRules } from './GroundRules';
import { GrassPlacer, type FlowerPlacerOptions, type GrassPlacerOptions } from './GrassPlacer';
import type { TallTuftInstancesFactory } from './TallTuftInstancesFactory';
import { TallTuftPlacer, type TallTuftOptions } from './TallTuftPlacer';
import { createWindSway, type WindSway } from './WindSway';

export interface GrassOptions {
  /** Sparse, wide tufts of the far ring. */
  grass: GrassPlacerOptions;
  /** Dense, narrow tufts of the near ring (drawn only within about 20 m of the camera). */
  nearGrass: GrassPlacerOptions;
  flowers: FlowerPlacerOptions;
  /** Clumps of tall seed-head grass in thick meadow. */
  seedHeads: TallTuftOptions;
  /** Reed clumps per pond (`clumps` is per pond; `extent` is unused). */
  pondReeds: TallTuftOptions;
  /** Reed clumps along the sea shore. */
  shoreReeds: TallTuftOptions;
  /** Height above the water level where grass starts (keeps beaches bare). */
  beachMargin: number;
  maxHeight: number;
  /** Max slope as rise over run. */
  maxSlope: number;
}

/** What the spawner is told about the ground besides its height: blockers, lawns, and the ponds for reeds. */
export type GrassGround = Pick<GroundRules, 'blockers' | 'feather' | 'lawns'> & { ponds?: readonly GrassBlocker[] };

/** Places grass, tall tufts and flowers and adds each as a swaying render entity. */
export class GrassSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly ground: HeightSampler,
    private readonly random: Random,
    private readonly grass: GrassInstancesFactory,
    private readonly flowers: FlowerInstancesFactory,
    private readonly tall: TallTuftInstancesFactory,
  ) {}

  spawn(
    options: GrassOptions,
    waterLevel: number,
    exclude: readonly ExclusionZone[] = [],
    ground: GrassGround = {},
  ): void {
    const { ponds = [], ...rest } = ground;
    const rules: GroundRules = {
      ...rest,
      minHeight: waterLevel + options.beachMargin,
      maxHeight: options.maxHeight,
      maxSlope: options.maxSlope,
      exclude,
    };
    const placer = new GrassPlacer(this.ground, this.random, rules);
    const windSway = createWindSway();
    const grass = { near: placer.grass(options.nearGrass), far: placer.grass(options.grass) };
    this.add(this.grass.create(grass, windSway), windSway);
    this.add(this.flowers.create(placer.flowers(options.flowers), windSway), windSway);
    // Drawn from the shared random after the flowers, so adding them moves nothing placed before.
    const tallPlacer = new TallTuftPlacer(this.ground, this.random, rules);
    const tall = {
      seedHeads: tallPlacer.seedHeads(options.seedHeads),
      reeds: tallPlacer.reeds(options.pondReeds, options.shoreReeds, ponds, waterLevel),
    };
    this.add(this.tall.create(tall, windSway), windSway);
  }

  private add(object: Object3D, windSway: WindSway): void {
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      renderObject: { object },
      windSway,
    });
  }
}
