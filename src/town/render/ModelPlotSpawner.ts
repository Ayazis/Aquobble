import type { GameWorld, Quat, Vec3 } from '@core';
import type { ColliderShape, PhysicsEngine } from '@physics';
import type {} from '@rendering';
import * as THREE from 'three';
import type { PlacedPlot } from '../PlacedTown';
import { extractCollisionMesh } from './extractCollisionMesh';
import { fitScale } from './fitScale';
import type { PlotSpawner } from './PlotSpawner';
import { SAILS_NODE } from './splitSails';
import type {} from '../WindmillSails';

const yawQuat = (yaw: number): Quat => ({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) });

/**
 * Places the loaded model for each plot, centred on the plot, standing on the ground and sized by `fitScale`, with a static
 * triangle-mesh collider built from the model's own (scaled) geometry, or a box around the model if that extraction fails.
 * Plots whose model is missing fall back to `fallback` (the grey box).
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
    this.createCollider(root, placed.plot.assetId, { x: position.x, y: position.y, z: position.z }, rotation, {
      x: (size.x * scale) / 2,
      y: (size.y * scale) / 2,
      z: (size.z * scale) / 2,
    });
    const sails = root.getObjectByName(SAILS_NODE);
    this.world.add({
      transform: { position: { ...position }, rotation },
      renderObject: { object: root },
      ...(sails ? { windmillSails: { object: sails, angle: 0 } } : {}),
    });
  }

  /** Trimesh in the root's local frame (body sits at the plot origin); falls back to a box standing on the ground. */
  private createCollider(root: THREE.Object3D, id: string, origin: Vec3, rotation: Quat, half: Vec3): void {
    const mesh = extractCollisionMesh(root);
    const trimesh: ColliderShape | null = mesh ? { type: 'trimesh', ...mesh } : null;
    if (trimesh) {
      try {
        this.physics.createBody({ kind: 'fixed', position: origin, rotation, shape: trimesh, friction: 0.8 });
        return;
      } catch (error) {
        console.warn(`Trimesh collider failed for ${id}, using a box.`, error);
      }
    }
    this.physics.createBody({
      kind: 'fixed',
      position: { x: origin.x, y: origin.y + half.y, z: origin.z },
      rotation,
      shape: { type: 'cuboid', halfExtents: half },
      friction: 0.8,
    });
  }
}
