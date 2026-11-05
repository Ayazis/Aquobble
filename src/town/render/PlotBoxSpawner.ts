import type { GameWorld, Quat } from '@core';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import * as THREE from 'three';
import type { PlacedPlot } from '../PlacedTown';
import { assetColor } from './assetColor';

const yawQuat = (yaw: number): Quat => ({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) });

/** Adds one placeholder entity per plot: a coloured box sized to its footprint plus a static box collider. */
export class PlotBoxSpawner {
  private readonly materials = new Map<string, THREE.Material>();

  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
  ) {}

  spawn({ plot, position }: PlacedPlot): void {
    const { width, depth, height } = plot.footprint;
    const center = { x: position.x, y: position.y + height / 2, z: position.z };
    const rotation = yawQuat(plot.rotation);
    const handle = this.physics.createBody({
      kind: 'fixed',
      position: center,
      rotation,
      shape: { type: 'cuboid', halfExtents: { x: width / 2, y: height / 2, z: depth / 2 } },
      friction: 0.8,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), this.material(plot.assetId));
    mesh.name = plot.assetId;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.world.add({
      transform: { position: center, rotation },
      physicsBody: { handle },
      renderObject: { object: mesh },
    });
  }

  private material(assetId: string): THREE.Material {
    let material = this.materials.get(assetId);
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color: assetColor(assetId), roughness: 0.9, flatShading: true });
      this.materials.set(assetId, material);
    }
    return material;
  }
}
