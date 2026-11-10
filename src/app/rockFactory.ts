import type { Random } from '@core';
import type { GltfModelLoader } from '@rendering';
import { ModelRockFactory, RockMeshFactory } from '@rocks';
import type { GameConfig } from './GameConfig';

/** Only fetch the rock model when the rain is on; the spawner still exists so the flag stays a pure toggle. */
export async function rockFactory(
  loader: GltfModelLoader,
  random: Random,
  config: GameConfig,
): Promise<ModelRockFactory | RockMeshFactory> {
  return config.fallingRocks && config.rockModel
    ? new ModelRockFactory(await loader.load(config.rockModel))
    : new RockMeshFactory(random);
}
