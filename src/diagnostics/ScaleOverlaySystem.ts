import type { GameWorld, System } from '@core';
import type {} from '@rendering';
import * as THREE from 'three';
import type { ScaleOverlayFactory } from './ScaleOverlayFactory';
import { BUILDING_MODELS, MEASURED_DOOR_HEIGHTS } from './scaleReference';

/** Metres in front of the camera where the grid and the figure stand. */
const AHEAD = 5;

/**
 * Frame system for `?debug&scale`. Keeps a 1 m grid and a 1.8 m figure on the ground just ahead of the camera
 * (snapped to whole metres), and puts a door-height marker beside every building model, found by its root's name.
 */
export class ScaleOverlaySystem implements System {
  private readonly grid: THREE.Object3D;
  private readonly figure: THREE.Object3D;
  private readonly marked = new WeakSet<THREE.Object3D>();
  private readonly forward = new THREE.Vector3();

  constructor(
    private readonly world: GameWorld,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    private readonly factory: ScaleOverlayFactory,
    private readonly groundHeight: (x: number, z: number) => number | null,
  ) {
    this.grid = factory.grid();
    this.figure = factory.figure();
    scene.add(this.grid, this.figure);
  }

  update(): void {
    this.followCamera();
    this.markBuildings();
  }

  private followCamera(): void {
    this.camera.getWorldDirection(this.forward);
    this.forward.y = 0;
    if (this.forward.lengthSq() > 0) this.forward.normalize();
    const x = Math.round(this.camera.position.x + this.forward.x * AHEAD);
    const z = Math.round(this.camera.position.z + this.forward.z * AHEAD);
    const y = this.groundHeight(x, z) ?? 0;
    this.grid.position.set(x, y + 0.02, z);
    this.figure.position.set(x, y, z);
  }

  private markBuildings(): void {
    for (const { renderObject, transform } of this.world.with('renderObject', 'transform')) {
      const root = renderObject.object;
      if (this.marked.has(root) || !BUILDING_MODELS.includes(root.name)) continue;
      this.marked.add(root);
      const box = new THREE.Box3().setFromObject(root);
      const height = box.max.y - box.min.y;
      const marker = this.factory.doorMarker(root.name, height, MEASURED_DOOR_HEIGHTS[root.name]);
      // Just past the building's +x side, on the ground under its centre.
      const { position } = transform;
      marker.position.set(Math.max(box.max.x, position.x) + 0.8, position.y, position.z);
      this.scene.add(marker);
    }
  }
}
