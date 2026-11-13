import * as THREE from 'three';
import type { GameWorld, System } from '@core';
import type { HeightSampler } from '@terrain';
import type { GrassCoverage } from './GrassCoverage';
import type {} from './GrassFieldComponent';
import { visibleGrassTiles } from './visibleGrassTiles';

/** Tallest grass plus sway (m): how far above the ground a tile's blades may reach. */
const BLADE_REACH = 1.6;

/**
 * Picks the tiles of every grass band the camera can see (frame system, after the camera has moved): tiles
 * outside the view, or with no grass on them, are not drawn at all, so the blade budget goes where it shows.
 */
export class GrassTileSystem implements System {
  private readonly fields;
  private readonly frustum = new THREE.Frustum();
  private readonly matrix = new THREE.Matrix4();
  private readonly box = new THREE.Box3();

  constructor(
    world: GameWorld,
    private readonly camera: THREE.Camera,
    private readonly ground: HeightSampler,
  ) {
    this.fields = world.with('grassField');
  }

  update(): void {
    this.camera.updateMatrixWorld();
    this.frustum.setFromProjectionMatrix(
      this.matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse),
    );
    const { x, z } = this.camera.position;
    for (const { grassField } of this.fields) {
      const wanted = (minX: number, minZ: number, size: number) => this.inView(grassField.coverage, minX, minZ, size);
      for (const set of grassField.tiles) {
        const count = visibleGrassTiles(set.band, x, z, wanted, set.origins);
        set.attribute.needsUpdate = true;
        set.geometry.instanceCount = count * set.band.side * set.band.side;
      }
    }
  }

  private inView(coverage: GrassCoverage, minX: number, minZ: number, size: number): boolean {
    if (!coverage.any(minX, minZ, size)) return false;
    let low = Infinity;
    let high = -Infinity;
    for (const [dx, dz] of [
      [0.5, 0.5],
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      const h = this.ground.heightAt(minX + dx * size, minZ + dz * size);
      low = Math.min(low, h);
      high = Math.max(high, h);
    }
    // Ground between the samples can sit a little outside them.
    const slack = 1 + size * 0.15;
    this.box.min.set(minX - 1, low - slack, minZ - 1);
    this.box.max.set(minX + size + 1, high + slack + BLADE_REACH, minZ + size + 1);
    return this.frustum.intersectsBox(this.box);
  }
}
