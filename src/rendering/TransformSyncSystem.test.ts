import { Object3D } from 'three';
import { createGameWorld, identityQuat, vec3 } from '@core';
import { TransformSyncSystem } from './TransformSyncSystem';

describe('TransformSyncSystem', () => {
  it('copies the simulated transform onto the three.js object', () => {
    const world = createGameWorld();
    const object = new Object3D();
    world.add({
      transform: { position: vec3(1, 2, 3), rotation: { ...identityQuat(), y: 1, w: 0 } },
      renderObject: { object },
    });
    new TransformSyncSystem(world).update();
    expect(object.position.toArray()).toEqual([1, 2, 3]);
    expect(object.quaternion.y).toBe(1);
  });
});
