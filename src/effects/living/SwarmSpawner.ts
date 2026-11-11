import type { GameWorld, Random, Vec3 } from '@core';
import type {} from '@rendering';
import type { SwarmKind, SwarmMember } from './SwarmKind';
import { SwarmMeshFactory } from './SwarmMeshFactory';
import { SwarmSystem } from './SwarmSystem';

interface SwarmLook {
  /** Members per anchor. */
  per: number;
  /** Height above the anchor (m), wander radius (m) and pace. */
  height: [number, number];
  radius: [number, number];
  speed: [number, number];
}

const LOOK: Readonly<Record<SwarmKind, SwarmLook>> = {
  butterfly: { per: 2, height: [0.5, 1.2], radius: [1.2, 3], speed: [0.6, 1.1] },
  firefly: { per: 6, height: [0.3, 1.6], radius: [0.8, 2.5], speed: [0.2, 0.45] },
  mote: { per: 14, height: [0.8, 2.5], radius: [0.3, 1.2], speed: [0.3, 0.7] },
};

/** Adds one instanced swarm around the given anchors; returns its frame system. */
export class SwarmSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly random: Random,
  ) {}

  spawn(kind: SwarmKind, anchors: readonly Vec3[], night: () => number): SwarmSystem {
    const r = this.random;
    const look = LOOK[kind];
    const members: SwarmMember[] = [];
    for (const a of anchors) {
      for (let i = 0; i < look.per; i++) {
        members.push({
          x: a.x + r.range(-1.5, 1.5),
          y: a.y + r.range(look.height[0], look.height[1]),
          z: a.z + r.range(-1.5, 1.5),
          radius: r.range(look.radius[0], look.radius[1]),
          phase: r.range(0, Math.PI * 2),
          speed: r.range(look.speed[0], look.speed[1]),
        });
      }
    }
    const mesh = new SwarmMeshFactory(r).create(kind, Math.max(members.length, 1));
    mesh.count = members.length;
    this.world.add({ renderObject: { object: mesh } });
    return new SwarmSystem(kind, members, mesh, night);
  }
}
