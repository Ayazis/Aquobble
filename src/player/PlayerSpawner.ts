import { identityQuat, type GameWorld } from '@core';
import type { Object3D } from 'three';
import type { PhysicsEngine } from '@physics';
import type {} from '@rendering';
import { DEFAULT_PLAYER } from './Player';
import { idleInput } from './PlayerInput';
import type { CharacterAnimation } from './CharacterAnimation';
import type { CharacterBuild } from './CharacterBuild';
import type { LanternFactory } from './LanternFactory';

const DROP_FROM = 500;

/** Builds what the player looks like: the animated model, or the capsule placeholder. */
export interface PlayerVisualFactory {
  create(halfHeight: number, radius: number): { object: Object3D; animation?: CharacterAnimation };
}

/** Adds the player: character-controlled capsule standing on the ground at (x, z), followed by the camera. */
export class PlayerSpawner {
  constructor(
    private readonly world: GameWorld,
    private readonly physics: PhysicsEngine,
    private readonly visuals: PlayerVisualFactory,
    private readonly build: CharacterBuild,
    private readonly lanterns?: LanternFactory,
  ) {}

  spawn(x: number, z: number): void {
    const { halfHeight, radius, cameraHeight } = this.build;
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
    // Hung on the node that turns with the character, so it stays at the same side.
    const lantern = this.lanterns?.create(visual.animation?.facing ?? visual.object);
    this.world.add({
      player: { ...DEFAULT_PLAYER },
      playerInput: idleInput(),
      characterBody,
      physicsBody: { handle: characterBody.body },
      cameraTarget: { height: cameraHeight, yaw: 0, ignoreBody: characterBody.body },
      transform: { position: { ...position }, rotation: identityQuat() },
      renderObject: { object: visual.object },
      ...(visual.animation ? { characterAnimation: visual.animation } : {}),
      ...(lantern ? { lantern } : {}),
    });
  }
}
