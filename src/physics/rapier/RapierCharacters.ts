import RAPIER from '@dimforge/rapier3d-compat';
import type { Vec3 } from '@core';
import type { BodyHandle } from '../BodyHandle';
import type { CharacterBody } from '../CharacterBody';
import type { CharacterDesc } from '../CharacterDesc';
import type { CharacterHandle } from '../CharacterHandle';
import type { CharacterMove } from '../CharacterMove';

/** Owns Rapier KinematicCharacterControllers and the kinematic capsules they move. */
export class RapierCharacters {
  private readonly controllers = new Map<CharacterHandle, RAPIER.KinematicCharacterController>();
  private nextHandle = 1;

  constructor(private readonly world: RAPIER.World) {}

  create(desc: CharacterDesc): CharacterBody {
    const { x, y, z } = desc.position;
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x, y, z));
    this.world.createCollider(RAPIER.ColliderDesc.capsule(desc.halfHeight, desc.radius).setFriction(0), body);

    const controller = this.world.createCharacterController(0.02);
    controller.setUp({ x: 0, y: 1, z: 0 });
    controller.setMaxSlopeClimbAngle(desc.maxSlopeClimb);
    controller.setMinSlopeSlideAngle(desc.maxSlopeClimb);
    controller.enableAutostep(desc.stepHeight, desc.radius * 0.5, false);
    controller.enableSnapToGround(desc.snapToGround);
    controller.setApplyImpulsesToDynamicBodies(true);

    const handle = this.nextHandle++ as CharacterHandle;
    this.controllers.set(handle, controller);
    return { body: body.handle as BodyHandle, controller: handle };
  }

  move(character: CharacterBody, desired: Vec3): CharacterMove {
    const controller = this.controllers.get(character.controller);
    const body = this.world.getRigidBody(character.body);
    if (!controller || !body) throw new Error(`Unknown character ${character.controller}`);

    controller.computeColliderMovement(body.collider(0), desired, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);
    const m = controller.computedMovement();
    const current = body.translation();
    body.setNextKinematicTranslation({ x: current.x + m.x, y: current.y + m.y, z: current.z + m.z });
    return { movement: { x: m.x, y: m.y, z: m.z }, grounded: controller.computedGrounded() };
  }
}
