import type { GameWorld, Random, System } from '@core';
import type {} from '@rendering';
import type { Wind } from '@wind';
import * as THREE from 'three';
import { createRustlePool } from './RustlePool';
import { RustleSystem } from './RustleSystem';

/** Motes alive at once (one draw call, a few hundred triangles). */
const POOL_SIZE = 64;

/**
 * Adds the pollen/seed mote mesh and returns the frame system that kicks motes up when the player runs
 * through tall grass. Pass a forked random (`random.fork('rustle')`).
 */
export class RustleSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly random: Random,
    private readonly wind?: Wind,
  ) {}

  spawn(): System {
    const material = new THREE.MeshBasicMaterial({ color: 0xf2e6a6, toneMapped: true });
    const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), material, POOL_SIZE);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    this.world.add({ renderObject: { object: mesh } });
    return new RustleSystem(this.world, mesh, createRustlePool(POOL_SIZE), this.random, this.wind);
  }
}
