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
