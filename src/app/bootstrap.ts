import { AnimationFrameScheduler, createGameWorld, GameLoop, SeededRandom, type GameWorld } from '@core';
import { Environment } from '@environment';
import { PhysicsBodyCleanup, PhysicsPoseSystem, PhysicsStepSystem, RapierPhysicsEngine } from '@physics';
import {
  PointerLookInput,
  GltfModelLoader,
  PostProcessing,
  RenderContext,
  RenderSystem,
  SceneMembership,
  SmoothZoom,
  DEFAULT_SMOOTH_ZOOM,
  ThirdPersonCameraSystem,
  TransformSyncSystem,
  ViewportResizer,
  WheelZoomInput,
} from '@rendering';
import {
  CharacterMovementSystem,
  KeyboardState,
  PlayerAnimationSystem,
  PlayerInputSystem,
  PlayerMeshFactory,
  PlayerModelFactory,
  PlayerSpawner,
  type AnimatedModel,
} from '@player';
import { TownsfolkAnimationSystem, TownsfolkMovementSystem } from '@townsfolk';
import { AmbientAudio } from '@audio';
import { FpsCounter, FpsOverlay, FpsSystem } from '@diagnostics';
import { BirdMeshFactory, BirdRenderSystem, DEFAULT_WILDLIFE, FlockSpawner, FlockSystem } from '@wildlife';
import { ModelRockFactory, RockMeshFactory, RockRecycleSystem, RockSpawner } from '@rocks';
import { WaterAnimationSystem } from '@water';
import { WindSwaySystem } from '@grass';
import { Game } from './Game';
import { DEFAULT_CONFIG, type GameConfig } from './GameConfig';
import { loadTownModels } from './loadTownModels';
import { populateWorld } from './populateWorld';
import { spawnTownsfolk } from './spawnTownsfolk';

const CHARACTER_MODEL = 'assets/models/town/character.glb';

/** Composition root: the only place that knows concrete classes and wires them together. */
export async function bootstrap(container: HTMLElement, config: GameConfig = DEFAULT_CONFIG): Promise<Game> {
  const world = createGameWorld();
  const random = new SeededRandom(config.seed);
  const physics = await RapierPhysicsEngine.create();

  const render = new RenderContext(container);
  const post = new PostProcessing(render);
  const dayNight = new Environment(config.environment).install(render);

  const loader = new GltfModelLoader();
  const [townModels, characterModel] = await Promise.all([loadTownModels(loader), loadCharacter(loader)]);
  const playerVisuals = characterModel ? new PlayerModelFactory(characterModel) : new PlayerMeshFactory();
  populateWorld(world, physics, random, config, townModels);
  const { birdMeshes, ambience } = spawnWildlife(world, config.seed);
  const rocks = new RockSpawner(world, physics, await rockFactory(loader, random, config));
  new PlayerSpawner(world, physics, playerVisuals).spawn(config.town.x, config.town.z + 8);
  // Own seed stream so townsfolk never shift the rest of the world's random draws.
  const folkRandom = new SeededRandom(config.seed + 1);
  const wanderArea = spawnTownsfolk(world, physics, folkRandom, config.town, config.townsfolk, characterModel);
  const keys = new KeyboardState();
  const look = new PointerLookInput(render.canvas);
  const zoom = new SmoothZoom({ ...DEFAULT_SMOOTH_ZOOM, minDistance: 2, maxDistance: 25 });
  const wheel = new WheelZoomInput(render.canvas, zoom);
  const fpsOverlay = new FpsOverlay(container);

  const loop = new GameLoop(new AnimationFrameScheduler(), {
    fixedSystems: [
      new PlayerInputSystem(world, keys),
      new CharacterMovementSystem(world, physics),
      new TownsfolkMovementSystem(world, physics, wanderArea, folkRandom),
      ...(config.fallingRocks ? [new RockRecycleSystem(world, rocks, random, config.rocks)] : []),
      new PhysicsStepSystem(physics),
      new PhysicsPoseSystem(world, physics),
      new FlockSystem(world),
    ],
    frameSystems: [
      new TransformSyncSystem(world),
      new WaterAnimationSystem(world, dayNight),
      new WindSwaySystem(world),
      new PlayerAnimationSystem(world),
      new TownsfolkAnimationSystem(world),
      new ThirdPersonCameraSystem(world, render.camera, physics, look, zoom),
      new BirdRenderSystem(world, birdMeshes.clock),
      ambience,
      dayNight,
      new RenderSystem(post),
      new FpsSystem(new FpsCounter(), fpsOverlay),
    ],
  });

  return new Game(loop, [
    new SceneMembership(world, render.scene),
    new PhysicsBodyCleanup(world, physics),
    new ViewportResizer(render, post),
    wheel,
    keys,
    look,
    fpsOverlay,
    ambience,
  ]);
}

/** Birds and ambient sound, each on its own seeded stream so they never shift the world's random sequence. */
function spawnWildlife(world: GameWorld, seed: number): { birdMeshes: BirdMeshFactory; ambience: AmbientAudio } {
  const birdMeshes = new BirdMeshFactory();
  new FlockSpawner(world, new SeededRandom(seed + 101), birdMeshes).spawn(DEFAULT_WILDLIFE);
  return { birdMeshes, ambience: new AmbientAudio(new SeededRandom(seed + 202)) };
}

/** Only fetch the rock model when the rain is on; the spawner still exists so the flag stays a pure toggle. */
async function rockFactory(
  loader: GltfModelLoader,
  random: SeededRandom,
  config: GameConfig,
): Promise<ModelRockFactory | RockMeshFactory> {
  return config.fallingRocks && config.rockModel
    ? new ModelRockFactory(await loader.load(config.rockModel))
    : new RockMeshFactory(random);
}

/** The rigged character, or null (capsules) if it fails to load. */
async function loadCharacter(loader: GltfModelLoader): Promise<AnimatedModel | null> {
  try {
    return await loader.loadAnimated(CHARACTER_MODEL);
  } catch (error) {
    console.warn('Character model failed to load; using the capsule.', error);
    return null;
  }
}
