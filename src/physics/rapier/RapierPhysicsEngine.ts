import RAPIER from '@dimforge/rapier3d-compat';
import type { Transform, Vec3 } from '@core';
import type { BodyDesc, BodyKind } from '../BodyDesc';
import type { BodyHandle } from '../BodyHandle';
import type { CharacterBody } from '../CharacterBody';
import type { CharacterDesc } from '../CharacterDesc';
import type { CharacterMove } from '../CharacterMove';
import type { PhysicsEngine } from '../PhysicsEngine';
import { RapierCharacters } from './RapierCharacters';
import { RapierColliderFactory } from './RapierColliderFactory';

const BODY_TYPES: Record<BodyKind, () => RAPIER.RigidBodyDesc> = {
  dynamic: () => RAPIER.RigidBodyDesc.dynamic(),
  fixed: () => RAPIER.RigidBodyDesc.fixed(),
  kinematic: () => RAPIER.RigidBodyDesc.kinematicPositionBased(),
};

/** PhysicsEngine backed by Rapier (Rust, compiled to WebAssembly). Create with `RapierPhysicsEngine.create()`. */
export class RapierPhysicsEngine implements PhysicsEngine {
  private readonly characters: RapierCharacters;
  /** Bodies were added since the last step, so the scene-query structures are stale. */
  private queriesStale = true;

  private constructor(
    private readonly world: RAPIER.World,
    private readonly colliders: RapierColliderFactory,
  ) {
    this.characters = new RapierCharacters(world);
  }

  /** Loads the WASM module (once) and creates a world. */
  static async create(gravity: Vec3 = { x: 0, y: -9.81, z: 0 }): Promise<RapierPhysicsEngine> {
    await RAPIER.init();
    return new RapierPhysicsEngine(new RAPIER.World(gravity), new RapierColliderFactory());
  }

  step(dt: number): void {
    this.world.timestep = dt;
    this.world.step();
    this.queriesStale = false;
  }

  createBody(desc: BodyDesc): BodyHandle {
    const bodyDesc = BODY_TYPES[desc.kind]().setTranslation(desc.position.x, desc.position.y, desc.position.z);
    if (desc.rotation) bodyDesc.setRotation(desc.rotation);
    const body = this.world.createRigidBody(bodyDesc);
    this.queriesStale = true;

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

  applyImpulseAt(handle: BodyHandle, impulse: Vec3, point: Vec3): void {
    this.body(handle).applyImpulseAtPoint(impulse, point, true);
  }

  addForce(handle: BodyHandle, force: Vec3): void {
    this.body(handle).addForce(force, true);
  }

  createCharacter(desc: CharacterDesc): CharacterBody {
    this.queriesStale = true;
    return this.characters.create(desc);
  }

  moveCharacter(character: CharacterBody, desired: Vec3): CharacterMove {
    return this.characters.move(character, desired);
  }

  castRay(origin: Vec3, direction: Vec3, maxDistance: number, exclude?: BodyHandle): number | null {
    if (this.queriesStale) this.refreshQueries();
    const ray = new RAPIER.Ray(origin, direction);
    const excludeBody = exclude === undefined ? undefined : this.body(exclude);
    const flags = RAPIER.QueryFilterFlags.EXCLUDE_SENSORS;
    const hit = this.world.castRay(ray, maxDistance, true, flags, undefined, undefined, excludeBody);
    return hit ? hit.timeOfImpact : null;
  }

  /** A zero-length step updates the broad phase so rays see newly added colliders, without moving anything. */
  private refreshQueries(): void {
    const timestep = this.world.timestep;
    this.step(0);
    this.world.timestep = timestep;
  }

  private body(handle: BodyHandle): RAPIER.RigidBody {
    const body = this.world.getRigidBody(handle);
    if (!body) throw new Error(`Unknown physics body ${handle}`);
    return body;
  }
}
