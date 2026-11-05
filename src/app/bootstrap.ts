import { AnimationFrameScheduler, createGameWorld, GameLoop, SeededRandom, vec3 } from '@core';
import { Environment } from '@environment';
import { PhysicsBodyCleanup, PhysicsPoseSystem, PhysicsStepSystem, RapierPhysicsEngine } from '@physics';
import {
  GltfModelLoader,
  OrbitCameraSystem,
  PostProcessing,
  RenderContext,
  RenderSystem,
  SceneMembership,
  SmoothZoom,
  TransformSyncSystem,
  ViewportResizer,
  WheelZoomInput,
} from '@rendering';
import { FpsCounter, FpsOverlay, FpsSystem } from '@diagnostics';
import { ModelRockFactory, RockMeshFactory, RockRecycleSystem, RockSpawner } from '@rocks';
import { Game } from './Game';
import { DEFAULT_CONFIG, type GameConfig } from './GameConfig';
import { populateWorld } from './populateWorld';

/** Composition root: the only place that knows concrete classes and wires them together. */
export async function bootstrap(container: HTMLElement, config: GameConfig = DEFAULT_CONFIG): Promise<Game> {
  const world = createGameWorld();
  const random = new SeededRandom(config.seed);
  const physics = await RapierPhysicsEngine.create();

  const render = new RenderContext(container);
  const post = new PostProcessing(render);
  new Environment(config.environment).install(render);

  populateWorld(world, physics, random, config);
  // Only fetch the model when the rain is on; the spawner still exists so the flag can stay a pure toggle.
  const rockModels =
    config.fallingRocks && config.rockModel
      ? new ModelRockFactory(await new GltfModelLoader().load(config.rockModel))
      : new RockMeshFactory(random);
  const rocks = new RockSpawner(world, physics, rockModels);

  const zoom = new SmoothZoom();
  const wheel = new WheelZoomInput(render.canvas, zoom);
  const fpsOverlay = new FpsOverlay(container);

  const loop = new GameLoop(new AnimationFrameScheduler(), {
    fixedSystems: [
      ...(config.fallingRocks ? [new RockRecycleSystem(world, rocks, random, config.rocks)] : []),
      new PhysicsStepSystem(physics),
      new PhysicsPoseSystem(world, physics),
    ],
    frameSystems: [
      new TransformSyncSystem(world),
      new OrbitCameraSystem(render.camera, render.canvas, zoom, vec3(90, 55, 90), vec3(0, 5, 0)),
      new RenderSystem(post),
      new FpsSystem(new FpsCounter(), fpsOverlay),
    ],
  });

  return new Game(loop, [
    new SceneMembership(world, render.scene),
    new PhysicsBodyCleanup(world, physics),
    new ViewportResizer(render, post),
    wheel,
    fpsOverlay,
  ]);
}
