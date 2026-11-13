import { AnimationFrameScheduler, createGameWorld, GameLoop, SeededRandom } from '@core';
import { PhysicsBodyCleanup, PhysicsPoseSystem, PhysicsStepSystem, RapierPhysicsEngine } from '@physics';
import {
  PostProcessing,
  RenderContext,
  RenderSystem,
  SceneMembership,
  ThirdPersonCameraSystem,
  TransformSyncSystem,
  ViewportResizer,
} from '@rendering';
import { CharacterMovementSystem, LanternSystem, PlayerAnimationSystem, PlayerInputSystem } from '@player';
import { TownsfolkAnimationSystem, TownsfolkMovementSystem } from '@townsfolk';
import { SailSystem } from '@town'; // lane A2: windmill sails
import { MuteButton } from '@audio';
import { createScaleOverlay, isDebugMode, isScaleMode } from '@diagnostics';
import { BirdRenderSystem, FlockSystem } from '@wildlife';
import { RockRecycleSystem, RockSpawner } from '@rocks';
import { SeaStateSystem, TideSystem, WaterAnimationSystem, WaterContactSystem } from '@water'; // lane C: water, tides
import { GrassTileSystem, GrassWatchdogSystem } from '@grass';
import { applyQualitySettings, type LoadingProgress, NO_PROGRESS, SettingsStore } from '@menu';
import { loadAllModels } from './loadAllModels';
import { loadingStage } from './loadingStage';
import { compileShaders } from './compileShaders';
import { installGrassPhysics } from './installGrassPhysics'; // lane B2: grass physics
import { spawnChimneySmoke } from './spawnChimneySmoke';
import { styleModels } from './styleModels';
import { createDebug } from './createDebug';
import { installEnvironment } from './installEnvironment';
import { Game } from './Game';
import { DEFAULT_CONFIG, type GameConfig } from './GameConfig';
import { forDevice, isMobileDevice } from './forDevice';
import { installStreetLighting } from './installStreetLighting';
import { bakeModelAo, installLight } from './installLight'; // lane D: light
import { installWind } from './installWind'; // lane W0-b: contracts
import { populateWorld } from './populateWorld';
import { rockFactory } from './rockFactory';
import { spawnPlayer } from './spawnPlayer';
import { spawnLivingDetails } from './spawnLivingDetails'; // lane F: living details
import { spawnTownsfolk } from './spawnTownsfolk';
import { waterPhysicsSystems } from './waterPhysicsSystems'; // lane C: water
import { installWaterReactions } from './installWaterReactions'; // lane C2
import { spawnWildlife } from './spawnWildlife';
import { installInput } from './installInput';
import { installMenu } from './installMenu';
import { createWeather, installWeather, OVERCAST_WIND_BOOST } from './installWeather'; // lane G: weather

/** Composition root: the only place that knows concrete classes and wires them together. */
export async function bootstrap(
  container: HTMLElement,
  progress: LoadingProgress = NO_PROGRESS,
  baseConfig: GameConfig = DEFAULT_CONFIG,
): Promise<Game> {
  const mobile = isMobileDevice();
  const settings = new SettingsStore();
  const device = forDevice(baseConfig, mobile);
  const config = device.config;
  const quality = applyQualitySettings(device.quality, settings.settings);
  const world = createGameWorld();
  const random = new SeededRandom(config.seed);
  await loadingStage(progress, 'Starting physics', 0.02);
  const physics = await RapierPhysicsEngine.create();

  const render = new RenderContext(container, quality);
  const post = new PostProcessing(render);
  const env = installEnvironment(config, render, post); // lane D: light
  // lane W0-b: contracts. Shared wind (CPU field + shader uniforms); consumers read wind.wind / wind.uniforms.
  const weather = createWeather(random); // lane G: weather
  const boost = () => 1 + OVERCAST_WIND_BOOST * weather.weather.mix.overcast; // lane G: weather
  const wind = installWind(random, () => env.dayNight.timeOfDay, boost);

  const { loader, townModels, characterModel, forestPack } = await loadAllModels(progress, 0.08, 0.6);
  await loadingStage(progress, 'Building the island', 0.62);
  const surfaces = styleModels(townModels, characterModel, quality.surfaceDetail);
  bakeModelAo(quality, [...townModels.values(), forestPack]); // lane D: light
  // lane B grass quality, lane C prevailing wind for the waves
  const heading = wind.wind.direction(0);
  const town = populateWorld(world, physics, random, config, townModels, surfaces, forestPack, quality, heading);
  const streetLights = installStreetLighting(world, townModels, env.dayNight, config.streetLights, quality.lampShadows); // lane D2
  const { birdMeshes, ambience } = spawnWildlife(world, config.seed);
  const rocks = new RockSpawner(world, physics, await rockFactory(loader, random, config));
  const build = spawnPlayer(world, physics, config, characterModel);
  await loadingStage(progress, 'Growing grass', 0.8);
  const grassPhysics = installGrassPhysics(world, render.renderer, quality, wind, random, build.bendRadius); // lane B2
  // Own seed stream so townsfolk never shift the rest of the world's random draws.
  const folkRandom = new SeededRandom(config.seed + 1);
  const folk = { ...config.townsfolk, ...config.scale };
  const navigator = spawnTownsfolk(world, physics, folkRandom, config.town, town.obstacles, folk, characterModel);
  const { keys, look, zoom, wheel, lanternButton, touch } = installInput(container, render, build, mobile);
  const debug = createDebug(isDebugMode(), container, render, env.dayNight, keys, physics);
  // lane W0-a: tools
  const scale = createScaleOverlay(isScaleMode(), world, render.scene, render.camera, physics);
  // end lane W0-a
  const waterFx = installWaterReactions(world, render, town.ripple, random, mobile); // lane C2
  const weatherSystems = installWeather(weather, {
    ...{ world, render, env, waterFx, random, mobile },
    ...{ water: town.water, wind: wind.wind, characterHeight: config.scale.playerHeight },
  }); // lane G: weather

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
      ...waterFx.fixedSystems, // lane C2
      new FlockSystem(world),
    ],
    frameSystems: [
      wind.system, // lane W0-b: contracts
      new TransformSyncSystem(world),
      new WaterAnimationSystem(world, 0.6, () => env.dayNight.nightAmount),
      new TideSystem(town.tide, () => env.dayNight.timeOfDay), // tides
      new SeaStateSystem(wind.wind, () => wind.system.elapsed, town.sea.swell, town.sea.wind),
      ...grassPhysics, // lane B2: grass physics (wind sway clock, bend map, rustle)
      new SailSystem(world, wind.uniforms), // lane A2: windmill sails
      new GrassWatchdogSystem(world), // lane B: grass
      new PlayerAnimationSystem(world),
      new LanternSystem(world, keys, lanternButton),
      new TownsfolkAnimationSystem(world),
      ...waterFx.frameSystems, // lane C2
      spawnChimneySmoke(world, config.seed),
      new ThirdPersonCameraSystem(world, render.camera, physics, look, zoom),
      ...debug.afterCamera,
      new GrassTileSystem(world, render.camera, town.nature.ground), // lane B: grass tiles in view
      ...scale, // lane W0-a: tools
      new BirdRenderSystem(world, birdMeshes.clock),
      ...spawnLivingDetails(world, random.fork('living'), config.waterLevel, town.nature, wind, env.dayNight), // lane F
      ambience,
      env.dayNight,
      ...weatherSystems, // lane G: weather
      streetLights,
      installLight(world, physics, env, town.area), // lane D: light
      new RenderSystem(post, render),
      ...debug.afterRender,
    ],
  });

  const targets = { loop, dayNight: env.dayNight, weather: weather.weather, audio: ambience, post, render };
  const menu = installMenu(container, settings, targets);
  await compileShaders(render, progress, 0.9);
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
    menu,
  ]);
}
