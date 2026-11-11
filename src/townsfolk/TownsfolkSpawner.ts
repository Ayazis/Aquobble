import { identityQuat, type GameWorld, type Random } from '@core';
import type { Navigator } from '@navigation';
import type { PhysicsEngine } from '@physics';
import type { CharacterBuild, PlayerVisualFactory } from '@player';
import type {} from '@rendering';
import { createTownsfolk } from './Townsfolk';

const DROP_FROM = 500;

/** Adds townsfolk: character-controlled capsules standing at random walkable spots. */
export class TownsfolkSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly visuals: PlayerVisualFactory,
    private readonly random: Random,
    private readonly build: CharacterBuild,
  ) {}

  spawn(count: number, navigator: Navigator, walkSpeed: number): void {
    const { halfHeight, radius } = this.build;
    for (let i = 0; i < count; i++) {
      const { x, z } = navigator.randomPoint(this.random);
      const hit = this.physics.castRay({ x, y: DROP_FROM, z }, { x: 0, y: -1, z: 0 }, DROP_FROM * 2);
      const groundY = hit === null ? 0 : DROP_FROM - hit;
      const position = { x, y: groundY + halfHeight + radius + 0.05, z };
      const characterBody = this.physics.createCharacter({
        position,
        halfHeight,
        radius,
        maxSlopeClimb: (50 * Math.PI) / 180,
        stepHeight: 0.4,
        snapToGround: 0.4,
      });
      const visual = this.visuals.create(halfHeight, radius);
      this.world.add({
        townsfolk: createTownsfolk(walkSpeed * this.random.range(0.8, 1.1), this.random.range(0, 4)),
        characterBody,
        physicsBody: { handle: characterBody.body },
        transform: { position: { ...position }, rotation: identityQuat() },
        renderObject: { object: visual.object },
        ...(visual.animation ? { characterAnimation: visual.animation } : {}),
      });
    }
  }
}
