import RAPIER from '@dimforge/rapier3d-compat';
import type { Transform, Vec3 } from '@core';
import type { BodyDesc, BodyKind } from '../BodyDesc';
import type { BodyHandle } from '../BodyHandle';
import type { PhysicsEngine } from '../PhysicsEngine';
import { RapierColliderFactory } from './RapierColliderFactory';

const BODY_TYPES: Record<BodyKind, () => RAPIER.RigidBodyDesc> = {
  dynamic: () => RAPIER.RigidBodyDesc.dynamic(),
  fixed: () => RAPIER.RigidBodyDesc.fixed(),
  kinematic: () => RAPIER.RigidBodyDesc.kinematicPositionBased(),
};

/** PhysicsEngine backed by Rapier (Rust, compiled to WebAssembly). Create with `RapierPhysicsEngine.create()`. */
export class RapierPhysicsEngine implements PhysicsEngine {
  private constructor(
    private readonly world: RAPIER.World,
    private readonly colliders: RapierColliderFactory,
  ) {}

  /** Loads the WASM module (once) and creates a world. */
  static async create(gravity: Vec3 = { x: 0, y: -9.81, z: 0 }): Promise<RapierPhysicsEngine> {
    await RAPIER.init();
    return new RapierPhysicsEngine(new RAPIER.World(gravity), new RapierColliderFactory());
  }

  step(dt: number): void {
    this.world.timestep = dt;
    this.world.step();
  }

  createBody(desc: BodyDesc): BodyHandle {
    const bodyDesc = BODY_TYPES[desc.kind]().setTranslation(desc.position.x, desc.position.y, desc.position.z);
    if (desc.rotation) bodyDesc.setRotation(desc.rotation);
    const body = this.world.createRigidBody(bodyDesc);

    const collider = this.colliders
      .create(desc.shape)
      .setDensity(desc.density ?? 1)
      .setFriction(desc.friction ?? 0.6)
      .setRestitution(desc.restitution ?? 0.1);
    this.world.createCollider(collider, body);
    return body.handle as BodyHandle;
  }

  removeBody(handle: BodyHandle): void {
    this.world.removeRigidBody(this.body(handle));
  }

  readPose(handle: BodyHandle, out: Transform): void {
    const body = this.body(handle);
    Object.assign(out.position, body.translation());
    Object.assign(out.rotation, body.rotation());
  }

  applyImpulse(handle: BodyHandle, impulse: Vec3): void {
    this.body(handle).applyImpulse(impulse, true);
  }

  addForce(handle: BodyHandle, force: Vec3): void {
    this.body(handle).addForce(force, true);
  }

  private body(handle: BodyHandle): RAPIER.RigidBody {
    const body = this.world.getRigidBody(handle);
    if (!body) throw new Error(`Unknown physics body ${handle}`);
    return body;
  }
}
