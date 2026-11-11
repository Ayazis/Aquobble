import type { Object3D } from 'three';
import type { GameWorld, Quat, Random } from '@core';
import type { PhysicsEngine } from '@physics';
import type { Pond } from '@terrain';
import type {} from '@rendering';
import type { Buoyant } from './Buoyant';
import type { FloaterMeshFactory } from './FloaterMeshFactory';
import type { WaterLevel } from './WaterLevel';

const PAD_THICKNESS = 0.02;
/** Tries per log to find shallow sea water near the beach. */
const LOG_TRIES = 200;

/** Adds floating physics bodies: driftwood off the beach and lily pads on the ponds. */
export class FloaterSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly water: WaterLevel,
    private readonly meshes: FloaterMeshFactory,
    private readonly random: Random,
  ) {}

  /** `count` logs in sea water 0.6 to 3 m deep, within `extent` of the centre. */
  driftwood(count: number, extent: number): void {
    for (let placed = 0, tries = 0; placed < count && tries < LOG_TRIES * count; tries++) {
      const x = this.random.range(-extent, extent);
      const z = this.random.range(-extent, extent);
      const surface = this.water.surfaceAt(x, z);
      const depth = surface - this.water.groundAt(x, z);
      if (depth < 0.6 || depth > 3) continue;
      const half = this.random.range(0.5, 1.1);
      const radius = this.random.range(0.1, 0.18);
      const along = half * 0.8;
      const points = [-1, -0.35, 0.35, 1].map((f) => ({ x: 0, y: along * f, z: 0 }));
      const buoyant = { points, volume: Math.PI * radius * radius * half * 2, halfHeight: radius, drag: 4 };
      // Lying down: the cylinder's y axis turned onto the horizontal, at a random heading.
      const rotation = lying(this.random.range(0, Math.PI * 2));
      const shape = { type: 'cylinder' as const, halfHeight: half, radius };
      this.add(this.meshes.log(half, radius), { x, y: surface + 0.2, z }, rotation, shape, 0.6, buoyant);
      placed++;
    }
  }

  /** A few loose pads near the bank of each pond. */
  lilyPads(ponds: readonly Pond[]): void {
    for (const pond of ponds) {
      const count = 3 + Math.floor(this.random.next() * Math.min(4, pond.radius));
      const patch = this.random.range(0, Math.PI * 2);
      for (let i = 0; i < count; i++) {
        const angle = patch + (i % 3) * 2.1 + this.random.range(-0.45, 0.45);
        const distance = pond.radius * this.random.range(0.45, 0.8);
        const radius = this.random.range(0.22, 0.42);
        const position = {
          x: pond.x + Math.cos(angle) * distance,
          y: pond.level,
          z: pond.z + Math.sin(angle) * distance,
        };
        const r = radius * 0.6;
        const points = [
          { x: r, y: 0, z: 0 },
          { x: -r, y: 0, z: 0 },
          { x: 0, y: 0, z: r },
          { x: 0, y: 0, z: -r },
        ];
        const buoyant = {
          points,
          volume: Math.PI * radius * radius * PAD_THICKNESS * 2,
          halfHeight: PAD_THICKNESS,
          drag: 6,
        };
        const object = this.meshes.lilyPad(radius, PAD_THICKNESS, this.random.range(0.27, 0.33));
        const shape = { type: 'cylinder' as const, halfHeight: PAD_THICKNESS, radius };
        this.add(object, position, upright(this.random.range(0, Math.PI * 2)), shape, 0.35, buoyant);
      }
    }
  }

  private add(
    object: Object3D,
    position: { x: number; y: number; z: number },
    rotation: Quat,
    shape: { type: 'cylinder'; halfHeight: number; radius: number },
    density: number,
    buoyant: Buoyant,
  ): void {
    const handle = this.physics.createBody({ kind: 'dynamic', position, rotation, shape, density, friction: 0.5 });
    this.world.add({
      transform: { position: { ...position }, rotation: { ...rotation } },
      physicsBody: { handle },
      renderObject: { object },
      buoyant,
    });
  }
}

/** Turned about y by `heading`, then laid on its side (y axis onto the horizontal). */
function lying(heading: number): Quat {
  const a = Math.cos(heading / 2);
  const b = Math.sin(heading / 2);
  const s = Math.SQRT1_2;
  // q_heading(y) * q_lay(z, 90 degrees)
  return { x: b * s, y: b * s, z: a * s, w: a * s };
}

function upright(heading: number): Quat {
  return { x: 0, y: Math.sin(heading / 2), z: 0, w: Math.cos(heading / 2) };
}
