import { vec3, type GameWorld, type Random, type System, type Vec3 } from '@core';
import { fallingLeavesMesh, FallingLeavesSystem, SwarmSpawner } from '@effects';
import type {} from '@player';
import type {} from '@rendering';
import { PondFishMeshFactory, PondFishSystem } from '@wildlife';
import type { Wind } from '@wind';
import type { InstalledWind } from './installWind';
import type { NatureAnchors } from './NatureAnchors';

/** Lane F: living details. How many anchors each swarm gathers round, and the leaf pool size. */
const BUTTERFLY_SPOTS = 32;
const FIREFLY_TREES = 24;
const MOTE_TREES = 14;
const LEAVES = 160;

interface LivingDetailsInput {
  nature: NatureAnchors;
  waterLevel: number;
  wind: Wind;
  windClock: () => number;
  /** 0 by day, 1 at night. */
  night: () => number;
}

/**
 * Lane F: living details. Butterflies over the meadows, fireflies by ponds and the forest edge at dusk, dust
 * motes under the crowns, leaves torn off on gusts and fish rising in the ponds. All on forks of `random`.
 * Returns the frame systems.
 */
export function spawnLivingDetails(
  world: GameWorld,
  random: Random,
  waterLevel: number,
  nature: NatureAnchors,
  wind: InstalledWind,
  day: { readonly nightAmount: number },
): System[] {
  const night = (): number => day.nightAmount;
  const input = { nature, waterLevel, wind: wind.wind, windClock: () => wind.system.elapsed, night };
  const grown = nature.trees.filter((t) => t.scale >= 0.5 && t.species !== 'dead');
  const pick = (r: Random, n: number): Vec3[] =>
    Array.from({ length: Math.min(n, grown.length) }, () => grown[Math.floor(r.next() * grown.length)])
      .filter((t) => t !== undefined)
      .map((t) => vec3(t.x, t.y, t.z));
  const swarms = new SwarmSpawner(world, random.fork('swarms'));
  const fireflyRandom = random.fork('fireflies');
  const shores = nature.ponds.flatMap((p) =>
    [0, 1, 2, 3].map((k) =>
      vec3(p.x + Math.cos(k * 1.57) * (p.radius + 1.5), p.level, p.z + Math.sin(k * 1.57) * (p.radius + 1.5)),
    ),
  );
  const player = world.with('player', 'transform');
  const leafSources = grown.map((t) => ({ x: t.x, crownY: t.y + 6 * t.scale, z: t.z, groundY: t.y }));
  const fish = new PondFishMeshFactory();
  const rings = fish.rings(16);
  const jumpers = fish.fish(4);
  const leaves = fallingLeavesMesh(LEAVES);
  for (const object of [rings, jumpers, leaves]) world.add({ renderObject: { object } });
  return [
    swarms.spawn('butterfly', meadowSpots(random.fork('butterflies'), input), night),
    swarms.spawn('firefly', [...shores, ...pick(fireflyRandom, FIREFLY_TREES)], night),
    swarms.spawn('mote', pick(random.fork('motes'), MOTE_TREES), night),
    new FallingLeavesSystem(
      leaves,
      leafSources,
      input.wind,
      input.windClock,
      () => player.first?.transform.position,
      random.fork('leaves'),
    ),
    new PondFishSystem(nature.ponds, rings, jumpers, random.fork('fish')),
  ];
}

/** Open, dry, gentle ground away from trees, where the flowers grow. */
function meadowSpots(r: Random, { nature, waterLevel }: LivingDetailsInput): Vec3[] {
  const spots: Vec3[] = [];
  for (let i = 0; i < 600 && spots.length < BUTTERFLY_SPOTS; i++) {
    const x = r.range(-80, 80);
    const z = r.range(-80, 80);
    const y = nature.ground.heightAt(x, z);
    if (y < waterLevel + 1.5 || y > 14) continue;
    if (nature.trees.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < 25)) continue;
    spots.push(vec3(x, y, z));
  }
  return spots;
}
