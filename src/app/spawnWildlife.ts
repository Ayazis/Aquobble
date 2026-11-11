import { SeededRandom, type GameWorld } from '@core';
import { AmbientAudio } from '@audio';
import { BirdMeshFactory, DEFAULT_WILDLIFE, FlockSpawner } from '@wildlife';

/** Birds and ambient sound, each on its own seeded stream so they never shift the world's random sequence. */
export function spawnWildlife(world: GameWorld, seed: number): { birdMeshes: BirdMeshFactory; ambience: AmbientAudio } {
  const birdMeshes = new BirdMeshFactory();
  new FlockSpawner(world, new SeededRandom(seed + 101), birdMeshes).spawn(DEFAULT_WILDLIFE);
  return { birdMeshes, ambience: new AmbientAudio(new SeededRandom(seed + 202)) };
}
