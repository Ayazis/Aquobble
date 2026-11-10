import { AnimationFrameScheduler, createGameWorld, GameLoop, SeededRandom, type GameWorld } from '@core';
import { Environment } from '@environment';
import { PhysicsBodyCleanup, PhysicsPoseSystem, PhysicsStepSystem, RapierPhysicsEngine } from '@physics';
import {
  PointerLookInput,
  GltfModelLoader,
  installToonLighting,
  ModelMaterialStyler,
  SurfaceDetailLibrary,
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
  LanternButton,
  LanternFactory,
  LanternSystem,
  PlayerAnimationSystem,
  PlayerInputSystem,
  PlayerMeshFactory,
  PlayerModelFactory,
  PlayerSpawner,
  TouchControls,
  type AnimatedModel,
} from '@player';
import { TownsfolkAnimationSystem, TownsfolkMovementSystem } from '@townsfolk';
import { AmbientAudio, MuteButton } from '@audio';
import { FpsCounter, FpsOverlay, FpsSystem } from '@diagnostics';
import { BirdMeshFactory, BirdRenderSystem, DEFAULT_WILDLIFE, FlockSpawner, FlockSystem } from '@wildlife';
import { RockRecycleSystem, RockSpawner } from '@rocks';
import { WaterAnimationSystem } from '@water';
import { GrassBendSystem, WindSwaySystem } from '@grass';
import type { Object3D } from 'three';
import { Game } from './Game';
import { DEFAULT_CONFIG, type GameConfig } from './GameConfig';
import { forDevice, isMobileDevice } from './forDevice';
import { loadTownModels } from './loadTownModels';
import { populateWorld } from './populateWorld';
import { rockFactory } from './rockFactory';
import { spawnTownsfolk } from './spawnTownsfolk';

const CHARACTER_MODEL = 'assets/models/town/character.glb';

/** Composition root: the only place that knows concrete classes and wires them together. */
export async function bootstrap(container: HTMLElement, baseConfig: GameConfig = DEFAULT_CONFIG): Promise<Game> {
  const mobile = isMobileDevice();
  const { config, quality } = forDevice(baseConfig, mobile);
  const world = createGameWorld();
  const random = new SeededRandom(config.seed);
  const physics = await RapierPhysicsEngine.create();

  installToonLighting();
  const render = new RenderContext(container, quality);
  const post = new PostProcessing(render);
  const dayNight = new Environment(config.environment).install(render, new SeededRandom(config.seed + 303));

  const loader = new GltfModelLoader();
  const [townModels, characterModel] = await Promise.all([loadTownModels(loader), loadCharacter(loader)]);
  const playerVisuals = characterModel ? new PlayerModelFactory(characterModel) : new PlayerMeshFactory();
  const surfaces = styleModels(townModels, characterModel, quality.surfaceDetail);
  const town = populateWorld(world, physics, random, config, townModels, surfaces);
  const { birdMeshes, ambience } = spawnWildlife(world, config.seed);
  const rocks = new RockSpawner(world, physics, await rockFactory(loader, random, config));
  new PlayerSpawner(world, physics, playerVisuals, new LanternFactory()).spawn(config.town.x, config.town.z + 8);
  // Own seed stream so townsfolk never shift the rest of the world's random draws.
  const folkRandom = new SeededRandom(config.seed + 1);
  const folk = config.townsfolk;
  const navigator = spawnTownsfolk(world, physics, folkRandom, config.town, town.obstacles, folk, characterModel);
  const keys = new KeyboardState();
  const look = new PointerLookInput(render.canvas);
  const zoom = new SmoothZoom({ ...DEFAULT_SMOOTH_ZOOM, minDistance: 2, maxDistance: 25 });
  const wheel = new WheelZoomInput(render.canvas, zoom);
  const fpsOverlay = new FpsOverlay(container);
  const lanternButton = new LanternButton(container);
  const touch = mobile ? new TouchControls(container) : undefined;

  const loop = new GameLoop(new AnimationFrameScheduler(), {
    fixedSystems: [
      new PlayerInputSystem(world, keys, touch),
      new CharacterMovementSystem(world, physics),
      new TownsfolkMovementSystem(world, physics, navigator, folkRandom),
      ...(config.fallingRocks ? [new RockRecycleSystem(world, rocks, random, config.rocks)] : []),
      new PhysicsStepSystem(physics),
      new PhysicsPoseSystem(world, physics),
      new FlockSystem(world),
    ],
    frameSystems: [
      new TransformSyncSystem(world),
      new WaterAnimationSystem(world),
      new WindSwaySystem(world),
      new GrassBendSystem(world),
      new PlayerAnimationSystem(world),
      new LanternSystem(world, keys, lanternButton),
      new TownsfolkAnimationSystem(world),
      new ThirdPersonCameraSystem(world, render.camera, physics, look, zoom),
      new BirdRenderSystem(world, birdMeshes.clock),
      ambience,
      dayNight,
      new RenderSystem(post, render),
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
    new MuteButton(container, ambience),
    lanternButton,
    ...(touch ? [touch] : []),
  ]);
}

/** One shared look for every model: matte materials, plus surface detail on the static town models where affordable. */
function styleModels(
  town: ReadonlyMap<string, Object3D>,
  character: AnimatedModel | null,
  detail: boolean,
): SurfaceDetailLibrary {
  // With no sources the library leaves every material flat: cheaper shaders for phones.
  const surfaces = new SurfaceDetailLibrary(detail ? undefined : {});
  const styler = new ModelMaterialStyler(surfaces);
  for (const model of town.values()) styler.style(model, true);
  if (character) styler.style(character.scene, false);
  surfaces.load();
  return surfaces;
}

/** Birds and ambient sound, each on its own seeded stream so they never shift the world's random sequence. */
function spawnWildlife(world: GameWorld, seed: number): { birdMeshes: BirdMeshFactory; ambience: AmbientAudio } {
  const birdMeshes = new BirdMeshFactory();
  new FlockSpawner(world, new SeededRandom(seed + 101), birdMeshes).spawn(DEFAULT_WILDLIFE);
  return { birdMeshes, ambience: new AmbientAudio(new SeededRandom(seed + 202)) };
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
