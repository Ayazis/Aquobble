import type { GameWorld, System } from '@core';
import type {} from '@rendering';
import { InstancedMesh, Matrix4, Object3D } from 'three';
import type { FlapClock } from './BirdMeshFactory';
import type {} from './Flock';

/** Presentation: writes each bird's pose into its flock's InstancedMesh and advances the flap clock. */
export class BirdRenderSystem implements System {
  private readonly flocks;
  private readonly dummy = new Object3D();
  private readonly matrix = new Matrix4();

  constructor(
    world: GameWorld,
    private readonly clock: FlapClock,
  ) {
    this.flocks = world.with('flock', 'renderObject');
  }

  update(dt: number): void {
    this.clock.value += dt;
    for (const { flock, renderObject } of this.flocks) {
      const mesh = renderObject.object;
      if (!(mesh instanceof InstancedMesh)) continue;
      flock.birds.forEach((bird, i) => {
        const { position: p, velocity: v } = bird;
        this.dummy.position.set(p.x, p.y, p.z);
        this.dummy.lookAt(p.x + v.x, p.y + v.y, p.z + v.z);
        this.dummy.updateMatrix();
        this.matrix.copy(this.dummy.matrix);
        mesh.setMatrixAt(i, this.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  }
}
