import { SeededRandom, type GameWorld, type System } from '@core';
import { SmokeSpawner } from '@effects';
import { chimneyTops } from './chimneyTops';

/** Smoke from every town chimney, on its own seed stream; call after the town is spawned. Returns its frame system. */
export function spawnChimneySmoke(world: GameWorld, seed: number): System {
  return new SmokeSpawner(world, new SeededRandom(seed + 404)).spawn(chimneyTops(world));
}
