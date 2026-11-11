import { identityQuat, vec3, type GameWorld, type Random } from '@core';
import type { HeightSampler } from '@terrain';
import type { ExclusionZone } from '@vegetation';
import type { Object3D } from 'three';
import type {} from '@rendering';
import { bakeGrassDensity } from './bakeGrassDensity';
import type { DensityGrid } from './DensityGrid';
import type { FlowerInstancesFactory } from './FlowerInstancesFactory';
import type { GrassQuality } from './GrassBand';
import { grassBands } from './grassBands';
import type { GrassBlocker } from './GrassBlocker';
import type { GrassFieldComponent } from './GrassFieldComponent';
import type { GrassDensityUniforms } from './GrassDensityUniforms';
import { setGrassDensity } from './GrassDensityUniforms';
import type { GrassFieldFactory } from './GrassFieldFactory';
import type { GroundRules } from './GroundRules';
import { GrassPlacer, type FlowerPlacerOptions } from './GrassPlacer';
import type { TallTuftInstancesFactory } from './TallTuftInstancesFactory';
import { TallTuftPlacer, type TallTuftOptions } from './TallTuftPlacer';
import { createWindSway, type WindSway } from './WindSway';

export interface GrassOptions {
  /** The density map: world size it covers and texels per side. */
  density: DensityGrid;
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

/** What the spawner is told about the ground besides its height: blockers, lawns, tree cover, ponds for reeds. */
export type GrassGround = Pick<GroundRules, 'blockers' | 'feather' | 'lawns' | 'canopyAt'> & {
  ponds?: readonly GrassBlocker[];
};

/**
 * Bakes the density map, adds the grass field (tufts placed on the GPU round the camera) and places the
 * flowers and tall tufts; each is a swaying render entity. Placements draw from `random.fork('grass')`.
 */
export class GrassSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly ground: HeightSampler,
    private readonly random: Random,
    private readonly density: GrassDensityUniforms,
    private readonly field: GrassFieldFactory,
    private readonly flowers: FlowerInstancesFactory,
    private readonly tall: TallTuftInstancesFactory,
  ) {}

  spawn(
    options: GrassOptions,
    waterLevel: number,
    quality: GrassQuality,
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
    setGrassDensity(this.density, bakeGrassDensity(this.ground, rules, options.density), options.density);
    // The grass and the ground fur share one clock.
    const windSway: WindSway = { ...createWindSway(), time: this.density.uGrassTime };
    this.add(this.field.create(grassBands(quality), windSway), windSway, { keep: this.density.uGrassKeep });

    const random = this.random.fork('grass');
    const placer = new GrassPlacer(this.ground, random, rules);
    this.add(this.flowers.create(placer.flowers(options.flowers), windSway), windSway);
    const tallPlacer = new TallTuftPlacer(this.ground, random, rules);
    const tall = {
      seedHeads: tallPlacer.seedHeads(options.seedHeads),
      reeds: tallPlacer.reeds(options.pondReeds, options.shoreReeds, ponds, waterLevel),
    };
    this.add(this.tall.create(tall, windSway), windSway);
  }

  private add(object: Object3D, windSway: WindSway, grassField?: GrassFieldComponent): void {
    this.world.add({
      transform: { position: vec3(), rotation: identityQuat() },
      renderObject: { object },
      windSway,
      ...(grassField ? { grassField } : {}),
    });
  }
}
