import type { GameWorld, Quat } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import * as THREE from 'three';
import type { PlacedPlot } from '../PlacedTown';
import { fitScale } from './fitScale';
import type { PlotSpawner } from './PlotSpawner';

const yawQuat = (yaw: number): Quat => ({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) });

/**
 * Places the loaded model for each plot, centred on the plot, standing on the ground and sized by `fitScale`, with a static box
 * collider around the model. Plots whose model is missing fall back to `fallback` (the grey box).
 */
export class ModelPlotSpawner implements PlotSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly models: ReadonlyMap<string, THREE.Object3D>,
    private readonly fallback: PlotSpawner,
  ) {}

  spawn(placed: PlacedPlot): void {
    const source = this.models.get(placed.plot.assetId);
    if (!source) return this.fallback.spawn(placed);

    const box = new THREE.Box3().setFromObject(source);
    const size = box.getSize(new THREE.Vector3());
    const scale = fitScale({ width: size.x, depth: size.z, height: size.y }, placed.plot.footprint);

    const model = source.clone();
    model.scale.setScalar(scale);
    // Centre horizontally and put the lowest point on the ground.
    const centre = box.getCenter(new THREE.Vector3());
    model.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
    model.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    const root = new THREE.Group();
    root.name = placed.plot.assetId;
    root.add(model);

    const { position } = placed;
    const rotation = yawQuat(placed.plot.rotation);
    const half = { x: (size.x * scale) / 2, y: (size.y * scale) / 2, z: (size.z * scale) / 2 };
    this.physics.createBody({
      kind: 'fixed',
      position: { x: position.x, y: position.y + half.y, z: position.z },
      rotation,
      shape: { type: 'cuboid', halfExtents: half },
      friction: 0.8,
    });
    this.world.add({
      transform: { position: { ...position }, rotation },
      renderObject: { object: root },
    });
  }
}
