import type { GameWorld, Vec3 } from '@core';
import type {} from '@rendering';
import { TOWN_CHIMNEYS } from '@town';
import * as THREE from 'three';

/**
 * World-space chimney tops of every spawned town building. Each building entity's render root is named after its
 * asset id and holds the fitted, centred model as its only child, so a model-space chimney maps through that
 * child's matrix and then the entity's transform. Call after the town is spawned.
 */
export function chimneyTops(world: GameWorld): Vec3[] {
  const tops: Vec3[] = [];
  const root = new THREE.Matrix4();
  const point = new THREE.Vector3();
  for (const { transform, renderObject } of world.with('transform', 'renderObject')) {
    const chimneys = TOWN_CHIMNEYS[renderObject.object.name];
    const model = renderObject.object.children[0];
    if (!chimneys || !model) continue;
    model.updateMatrix();
    const { position: p, rotation: q } = transform;
    root.compose(
      new THREE.Vector3(p.x, p.y, p.z),
      new THREE.Quaternion(q.x, q.y, q.z, q.w),
      new THREE.Vector3(1, 1, 1),
    );
    for (const c of chimneys) {
      point.set(c.x, c.y, c.z).applyMatrix4(model.matrix).applyMatrix4(root);
      tops.push({ x: point.x, y: point.y, z: point.z });
    }
  }
  return tops;
}
