import { AnimationFrameScheduler, createGameWorld, GameLoop, SeededRandom, type GameWorld } from '@core';
import { PhysicsBodyCleanup, PhysicsPoseSystem, PhysicsStepSystem, RapierPhysicsEngine } from '@physics';
import {
  PointerLookInput,
  GltfModelLoader,
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
  LanternSystem,
  PlayerAnimationSystem,
  PlayerInputSystem,
  TouchControls,
  type AnimatedModel,
} from '@player';
import { TownsfolkAnimationSystem, TownsfolkMovementSystem } from '@townsfolk';
import { SailSystem } from '@town'; // lane A2: windmill sails
import { AmbientAudio, MuteButton } from '@audio';
import { createScaleOverlay, isDebugMode, isScaleMode } from '@diagnostics';
import { BirdMeshFactory, BirdRenderSystem, DEFAULT_WILDLIFE, FlockSpawner, FlockSystem } from '@wildlife';
import { RockRecycleSystem, RockSpawner } from '@rocks';
import { WaterAnimationSystem, WaterContactSystem } from '@water'; // lane C: water
import { GrassBendSystem, GrassWatchdogSystem, WindSwaySystem } from '@grass';
import type { Object3D } from 'three';
import { spawnChimneySmoke } from './spawnChimneySmoke';
import { createDebug } from './createDebug';
import { installEnvironment } from './installEnvironment';
import { Game } from './Game';
import { DEFAULT_CONFIG, type GameConfig } from './GameConfig';
import { forDevice, isMobileDevice } from './forDevice';
import { installStreetLighting } from './installStreetLighting';
import { bakeModelAo, installLight } from './installLight'; // lane D: light
import { installWind } from './installWind'; // lane W0-b: contracts
import { loadCharacterModel } from './loadCharacterModel';
import { loadForestModels } from './loadForestModels';
import { loadTownModels } from './loadTownModels';
import { populateWorld } from './populateWorld';
import { rockFactory } from './rockFactory';
import { spawnPlayer } from './spawnPlayer';
import { spawnTownsfolk } from './spawnTownsfolk';
import { waterPhysicsSystems } from './waterPhysicsSystems'; // lane C: water

/** Composition root: the only place that knows concrete classes and wires them together. */
export async function bootstrap(container: HTMLElement, baseConfig: GameConfig = DEFAULT_CONFIG): Promise<Game> {
  const mobile = isMobileDevice();
  const { config, quality } = forDevice(baseConfig, mobile);
  const world = createGameWorld();
  const random = new SeededRandom(config.seed);
  const physics = await RapierPhysicsEngine.create();

  const render = new RenderContext(container, quality);
  const post = new PostProcessing(render);
  const env = installEnvironment(config, render, post); // lane D: light
  // lane W0-b: contracts. Shared wind (CPU field + shader uniforms); consumers read wind.wind / wind.uniforms.
  const wind = installWind(random, () => env.dayNight.timeOfDay);

  const loader = new GltfModelLoader();
  const [townModels, characterModel, forestPack] = await Promise.all([
    loadTownModels(loader),
    loadCharacterModel(loader),
    loadForestModels(loader),
  ]);
  const surfaces = styleModels(townModels, characterModel, quality.surfaceDetail);
  bakeModelAo(quality, [...townModels.values(), forestPack]); // lane D: light
  // lane B grass quality, lane C prevailing wind for the waves
  const town = populateWorld(
    world,
    physics,
    random,
    config,
    townModels,
    surfaces,
    forestPack,
    quality,
    wind.wind.direction(0),
  );
  const streetLights = installStreetLighting(world, townModels, env.dayNight, config.streetLights, quality.lampShadows); // lane D2
  const { birdMeshes, ambience } = spawnWildlife(world, config.seed);
  const rocks = new RockSpawner(world, physics, await rockFactory(loader, random, config));
  const build = spawnPlayer(world, physics, config, characterModel);
  // Own seed stream so townsfolk never shift the rest of the world's random draws.
  const folkRandom = new SeededRandom(config.seed + 1);
  const folk = { ...config.townsfolk, ...config.scale };
  const navigator = spawnTownsfolk(world, physics, folkRandom, config.town, town.obstacles, folk, characterModel);
  const keys = new KeyboardState();
  const look = new PointerLookInput(render.canvas);
  const { minCameraDistance: minDistance, maxCameraDistance: maxDistance } = build;
  const zoom = new SmoothZoom({ ...DEFAULT_SMOOTH_ZOOM, minDistance, maxDistance });
  const wheel = new WheelZoomInput(render.canvas, zoom);
  const debug = createDebug(isDebugMode(), container, render, env.dayNight, keys, physics);
  // lane W0-a: tools
  const scale = createScaleOverlay(isScaleMode(), world, render.scene, render.camera, physics);
  // end lane W0-a
  const lanternButton = new LanternButton(container);
  const touch = mobile ? new TouchControls(container) : undefined;

  const loop = new GameLoop(new AnimationFrameScheduler(), {
    fixedSystems: [
      new PlayerInputSystem(world, keys, touch),
      new WaterContactSystem(world, town.water), // lane C: water
      new CharacterMovementSystem(world, physics),
      new TownsfolkMovementSystem(world, physics, navigator, folkRandom),
      ...(config.fallingRocks ? [new RockRecycleSystem(world, rocks, random, config.rocks)] : []),
      ...waterPhysicsSystems(world, physics, town.water), // lane C: water
      new PhysicsStepSystem(physics),
      new PhysicsPoseSystem(world, physics),
      new FlockSystem(world),
    ],
    frameSystems: [
      wind.system, // lane W0-b: contracts
      new TransformSyncSystem(world),
      new WaterAnimationSystem(world, 0.6, () => env.dayNight.nightAmount),
      new WindSwaySystem(world),
      new SailSystem(world, wind.uniforms), // lane A2: windmill sails
      new GrassBendSystem(world, build.bendRadius),
      new GrassWatchdogSystem(world), // lane B: grass
      new PlayerAnimationSystem(world),
      new LanternSystem(world, keys, lanternButton),
      new TownsfolkAnimationSystem(world),
      spawnChimneySmoke(world, config.seed),
      new ThirdPersonCameraSystem(world, render.camera, physics, look, zoom),
      ...debug.afterCamera,
      ...scale, // lane W0-a: tools
      new BirdRenderSystem(world, birdMeshes.clock),
      ambience,
      env.dayNight,
      streetLights,
      installLight(world, physics, env, town.area), // lane D: light
      new RenderSystem(post, render),
      ...debug.afterRender,
    ],
  });

  return new Game(loop, [
    new SceneMembership(world, render.scene),
    new PhysicsBodyCleanup(world, physics),
    new ViewportResizer(render, post),
    wheel,
    keys,
    look,
    ...debug.disposables,
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
