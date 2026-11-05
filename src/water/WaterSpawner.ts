import { identityQuat, vec3, type GameWorld } from '@core';
import type {} from '@rendering';
import type { WaterMesh } from './WaterMesh';
import type { WaterMeshFactory } from './WaterMeshFactory';
import './WaterSurface';

/** Creates the sea entity and the pond surfaces. */
export class WaterSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly meshes: WaterMeshFactory,
  ) {}

  spawn(level: number): void {
    this.add(this.meshes.createSea(), 0, level, 0);
  }

  spawnPond(x: number, z: number, radius: number, level: number): void {
    this.add(this.meshes.createPond(radius), x, level, z);
  }

  private add(mesh: WaterMesh, x: number, y: number, z: number): void {
    this.world.add({
      transform: { position: vec3(x, y, z), rotation: identityQuat() },
      renderObject: { object: mesh.object },
      waterSurface: mesh.surface,
    });
  }
}
