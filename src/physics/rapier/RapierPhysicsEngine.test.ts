import { RapierPhysicsEngine } from './RapierPhysicsEngine';
import { identityQuat, vec3, type Transform } from '@core';

const settle = (engine: RapierPhysicsEngine, seconds: number) => {
  for (let i = 0; i < seconds * 60; i++) engine.step(1 / 60);
};

/** Integration tests against the real Rapier WASM build. */
describe('RapierPhysicsEngine', () => {
  it('lets a dynamic ball fall under gravity', async () => {
    const engine = await RapierPhysicsEngine.create();
    const ball = engine.createBody({ kind: 'dynamic', position: vec3(0, 10, 0), shape: { type: 'ball', radius: 0.5 } });
    settle(engine, 0.5);
    const pose: Transform = { position: vec3(), rotation: identityQuat() };
    engine.readPose(ball, pose);
    expect(pose.position.y).toBeLessThan(10);
  });

  it('rests a box on a sloped height field at the right height (axis mapping)', async () => {
    const engine = await RapierPhysicsEngine.create();
    // 3x3 grid, 20 m wide, rising along +x (columns): heights 0, 2, 4.
    const heights = new Float32Array([0, 2, 4, 0, 2, 4, 0, 2, 4]);
    engine.createBody({
      kind: 'fixed',
      position: vec3(),
      shape: { type: 'heightField', rows: 3, columns: 3, heights, size: { x: 20, z: 20 } },
    });
    // At x = +5 the surface is at 3 (column 1 at x=0 is 2, column 2 at x=10 is 4).
    // If x and z were swapped the surface there would be at 2 instead.
    const box = engine.createBody({
      kind: 'dynamic',
      position: vec3(5, 6, 0),
      shape: { type: 'cuboid', halfExtents: vec3(0.5, 0.5, 0.5) },
      friction: 10,
    });
    settle(engine, 2);
    const pose: Transform = { position: vec3(), rotation: identityQuat() };
    engine.readPose(box, pose);
    expect(pose.position.y).toBeGreaterThan(3.2);
    expect(pose.position.y).toBeLessThan(3.8);
  });
});

describe('RapierPhysicsEngine characters and rays', () => {
  const flatGround = (engine: RapierPhysicsEngine) =>
    engine.createBody({
      kind: 'fixed',
      position: vec3(0, -0.5, 0),
      shape: { type: 'cuboid', halfExtents: vec3(50, 0.5, 50) },
    });

  it('stops a character at a wall and reports it grounded', async () => {
    const engine = await RapierPhysicsEngine.create();
    flatGround(engine);
    engine.createBody({
      kind: 'fixed',
      position: vec3(3, 1, 0),
      shape: { type: 'cuboid', halfExtents: vec3(0.5, 1, 5) },
    });
    const character = engine.createCharacter({
      position: vec3(0, 0.95, 0),
      halfHeight: 0.5,
      radius: 0.4,
      maxSlopeClimb: Math.PI / 4,
      stepHeight: 0.3,
      snapToGround: 0.3,
    });
    let grounded = false;
    for (let i = 0; i < 120; i++) {
      grounded = engine.moveCharacter(character, vec3(0.1, -0.1, 0)).grounded;
      engine.step(1 / 60);
    }
    const pose: Transform = { position: vec3(), rotation: identityQuat() };
    engine.readPose(character.body, pose);
    expect(grounded).toBe(true);
    expect(pose.position.x).toBeLessThan(2.2);
    expect(pose.position.x).toBeGreaterThan(1.9);
  });

  it('casts a ray to the ground and can exclude a body', async () => {
    const engine = await RapierPhysicsEngine.create();
    const ground = flatGround(engine);
    expect(engine.castRay(vec3(0, 10, 0), vec3(0, -1, 0), 100)).toBeCloseTo(10, 3);
    expect(engine.castRay(vec3(0, 10, 0), vec3(0, -1, 0), 100, ground)).toBeNull();
  });

  it('stops a character at a fixed trimesh wall', async () => {
    const engine = await RapierPhysicsEngine.create();
    flatGround(engine);
    // Vertical quad in the plane x = 3 (two triangles, wound both ways is irrelevant for a fixed trimesh).
    const vertices = new Float32Array([3, 0, -5, 3, 0, 5, 3, 3, 5, 3, 3, -5]);
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
    engine.createBody({ kind: 'fixed', position: vec3(), shape: { type: 'trimesh', vertices, indices } });
    const character = engine.createCharacter({
      position: vec3(0, 0.95, 0),
      halfHeight: 0.5,
      radius: 0.4,
      maxSlopeClimb: Math.PI / 4,
      stepHeight: 0.3,
      snapToGround: 0.3,
    });
    for (let i = 0; i < 120; i++) {
      engine.moveCharacter(character, vec3(0.1, -0.1, 0));
      engine.step(1 / 60);
    }
    const pose: Transform = { position: vec3(), rotation: identityQuat() };
    engine.readPose(character.body, pose);
    expect(pose.position.x).toBeLessThan(2.7);
    expect(pose.position.x).toBeGreaterThan(2.4);
  });
});
