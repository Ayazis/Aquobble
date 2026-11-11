import type { GameWorld } from '@core';
import type { PhysicsEngine } from '@physics';
import {
  characterBuild,
  LanternFactory,
  PlayerMeshFactory,
  PlayerModelFactory,
  PlayerSpawner,
  type AnimatedModel,
  type CharacterBuild,
} from '@player';
import type { GameConfig } from './GameConfig';

/**
 * Spawns the player (the rigged character, or a capsule if it failed to load) with a hand lantern, a step
 * south of the town centre, and returns the sizes derived from its height for the camera and grass.
 */
export function spawnPlayer(
  world: GameWorld,
  physics: PhysicsEngine,
  config: GameConfig,
  model: AnimatedModel | null,
): CharacterBuild {
  const build = characterBuild(config.scale.playerHeight);
  const visuals = model ? new PlayerModelFactory(model, build.height) : new PlayerMeshFactory();
  const lanterns = new LanternFactory(build.height);
  new PlayerSpawner(world, physics, visuals, build, lanterns).spawn(config.town.x, config.town.z + 8);
  return build;
}
