import type { GameWorld, System } from '@core';
import {
  LightPoolFactory,
  NightGlow,
  scaleToPost,
  StreetLightSystem,
  type DayClock,
  type StreetLightOptions,
} from '@lighting';
import type {} from '@player';
import type {} from '@rendering';
import { DEFAULT_TOWN_LAYOUT, TOWN_ASSET_SIZES } from '@town';
import * as THREE from 'three';
import { LAMP_ASSET } from './spawnStreetLamps';

/**
 * Night lighting for the town: glowing lamp glass and windows, a painted pool of light under every street
 * lamp, and `lightCount` real lights that follow the player from lamp to lamp. Call after the models are
 * styled (it adds to their shaders) and the town is spawned; returns the frame system that runs it all.
 */
export function installStreetLighting(
  world: GameWorld,
  models: ReadonlyMap<string, THREE.Object3D>,
  clock: DayClock,
  tuned: StreetLightOptions,
): System {
  const options = scaleToPost(tuned, TOWN_ASSET_SIZES[LAMP_ASSET].height);
  const glow = new NightGlow();
  for (const material of materialsOf(models.get(LAMP_ASSET))) glow.lamp(material, options.lampGlow);
  for (const id of new Set(DEFAULT_TOWN_LAYOUT.buildings.map((plot) => plot.assetId))) {
    for (const material of materialsOf(models.get(id))) {
      glow.windows(material, options.windowColor, options.windowGlow);
    }
  }

  const lamps = [...world.with('streetLamp')].map((entity) => entity.streetLamp);
  const pools = new LightPoolFactory(options.poolRadius, options.poolLift, options.poolColor).create(
    lamps.map((lamp) => lamp.ground),
  );
  world.add({ renderObject: { object: pools.object } });

  // All lights exist from the first frame, at zero strength: adding one later would recompile every lit shader.
  const count = Math.min(options.lightCount, lamps.length);
  const lights = Array.from({ length: count }, (_, i) => {
    const light = new THREE.PointLight(options.lightColor, 0, options.lightReach, options.lightDecay);
    light.position.copy(lamps[i].glass);
    return light;
  });
  if (lights.length > 0) world.add({ renderObject: { object: new THREE.Group().add(...lights) } });

  const players = world.with('player', 'transform');
  const focus = () => players.first?.transform.position;
  return new StreetLightSystem(world, clock, glow.strength, pools, lights, focus, options);
}

/** Every distinct material on a model; none if the model failed to load. */
function materialsOf(model: THREE.Object3D | undefined): Set<THREE.Material> {
  const found = new Set<THREE.Material>();
  model?.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const material = node.material as THREE.Material | THREE.Material[];
    for (const m of Array.isArray(material) ? material : [material]) found.add(m);
  });
  return found;
}
