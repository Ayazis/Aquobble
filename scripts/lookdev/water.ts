// Look-dev page for the water: the real render pipeline, terrain, sea, ponds, ripples and floating wood, without
// the town, forest and grass, so a frame is quick even without a GPU. Query: t (time of day), from/at (x,y,z;
// y is metres above the ground or the sea, whichever is higher), wt (seconds of water time to run first),
// drops (ripple stamps in front of the camera), mobile=1 (the phone profile), overcast.
import * as THREE from 'three';
import { createGameWorld, SeededRandom } from '@core';
import { DEFAULT_ENVIRONMENT, Environment } from '@environment';
import { PhysicsPoseSystem, PhysicsStepSystem, RapierPhysicsEngine } from '@physics';
import { HIGH_QUALITY, installSceneLighting, PostProcessing, RenderContext, SceneMembership } from '@rendering';
import { TransformSyncSystem } from '@rendering';
import { FractalNoise, TerrainGenerator, TerrainMeshFactory, TerrainSpawner, ValueNoise } from '@terrain';
import { RippleSimulation, TideSystem, WaterAnimationSystem, wetSandHook } from '@water';
import { DEFAULT_CONFIG } from '../../src/app/GameConfig';
import { MOBILE_QUALITY } from '../../src/app/forDevice';
import { populateWater } from '../../src/app/populateWater';
import { waterPhysicsSystems } from '../../src/app/waterPhysicsSystems';

const params = new URLSearchParams(location.search);
const num = (name: string, fallback: number) => Number(params.get(name) ?? fallback);
const triple = (name: string, fallback: string) => (params.get(name) ?? fallback).split(',').map(Number);
const mobile = params.get('mobile') === '1';
const config = DEFAULT_CONFIG;
const container = document.getElementById('app') as HTMLElement;
const render = new RenderContext(container, mobile ? MOBILE_QUALITY : HIGH_QUALITY);
if (params.get('shadows') === '0') render.renderer.shadowMap.enabled = false;
const post = new PostProcessing(render);
const lighting = installSceneLighting(true);
const env = new Environment({ ...DEFAULT_ENVIRONMENT, dayLengthSeconds: 0, startTimeOfDay: num('t', 0.5) });
const dayNight = env.install(render, new SeededRandom(1), post, lighting.cloudShadow);
dayNight.overcast = num('overcast', 0);

const world = createGameWorld();
const random = new SeededRandom(config.seed);
const physics = await RapierPhysicsEngine.create();
const terrain = new TerrainGenerator(new FractalNoise(new ValueNoise(random)), config.terrain).generate();
const wind = { x: Math.cos(num('wind', 0.6)), z: Math.sin(num('wind', 0.6)) };
const water = populateWater(world, terrain, random, config, [], physics, wind, render.quality);
water.sea.swell.value = num('swell', 1);
water.sea.wind.value.z = num('breeze', 0.5);
const meshes = new TerrainMeshFactory(undefined, undefined, undefined, config.waterLevel, wetSandHook(water.tide));
new TerrainSpawner(world, physics, meshes).spawn(terrain);
// A few boulders and posts in the shallows, for reflections, refraction and foam round obstacles.
const stone = new THREE.MeshStandardMaterial({ color: 0x8a8578, roughness: 0.85 });
const wood = new THREE.MeshStandardMaterial({ color: 0x9a6b3f, roughness: 0.8 });
const props = new SeededRandom(7);
for (let i = 0; i < num('props', 60); i++) {
  const angle = props.range(0, Math.PI * 2);
  let r = 20;
  while (r < 99 && terrain.heightAt(Math.cos(angle) * r, Math.sin(angle) * r) > config.waterLevel - props.range(0, 0.9))
    r += 0.5;
  const [x, z] = [Math.cos(angle) * r, Math.sin(angle) * r];
  const post = i % 3 === 0;
  const mesh = post
    ? new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.4, 10), wood)
    : new THREE.Mesh(new THREE.DodecahedronGeometry(props.range(0.4, 1.3), 1), stone);
  mesh.position.set(x, terrain.heightAt(x, z) + (post ? 1 : 0.2), z);
  mesh.rotation.set(post ? 0.05 : props.range(0, 3), props.range(0, 3), 0);
  mesh.castShadow = mesh.receiveShadow = true;
  render.scene.add(mesh);
}
new SceneMembership(world, render.scene);
// nowater=1 hides the water, to tell what is on the bed from what the water adds.
if (params.get('nowater') === '1')
  for (const e of world.with('waterSurface', 'renderObject')) e.renderObject.object.visible = false;
const ripples = new RippleSimulation(render.renderer, water.ripple, render.quality.water.rippleMapSize, 40);

const ground = (x: number, z: number) => Math.max(terrain.heightAt(x, z), config.waterLevel);
const from = triple('from', '38,2,62');
const at = triple('at', '10,1,40');
const abs = params.get('abs') === '1';
render.camera.position.set(from[0], abs ? from[1] : ground(from[0], from[2]) + from[1], from[2]);
render.camera.lookAt(at[0], abs ? at[1] : ground(at[0], at[2]) + at[1], at[2]);
render.camera.updateMatrixWorld();
const focus = new THREE.Vector3(0, 0, -6).applyMatrix4(render.camera.matrixWorld);

const fixed = [
  ...waterPhysicsSystems(world, physics, water.water),
  new PhysicsStepSystem(physics),
  new PhysicsPoseSystem(world, physics),
];
const frameSystems = [
  new TransformSyncSystem(world),
  new WaterAnimationSystem(world, 0.6, () => dayNight.nightAmount),
  new TideSystem(water.tide, () => dayNight.timeOfDay),
];
const drops = num('drops', 0);
const step = (dt: number, n: number) => {
  for (const s of fixed) s.update(dt);
  for (const s of frameSystems) s.update(dt);
  if (drops > 0 && n % 40 === 0) {
    const a = props.range(0, 6.28);
    const d = props.range(0, 4);
    ripples.stamp(focus.x + Math.cos(a) * d, focus.z + Math.sin(a) * d, props.range(0.15, 0.5), 0.25 * drops);
  }
  ripples.step(focus.x, focus.z);
};
const warm = Math.round(num('wt', 4) * 60);
for (let i = 0; i < warm; i++) step(1 / 60, i);
let frame = 0;
const live = params.get('live') === '1';
const tick = () => {
  if (live) step(1 / 60, warm + frame);
  dayNight.update(1 / 60);
  render.beginFrame();
  post.render();
  (window as unknown as { __frame: number }).__frame = ++frame;
  requestAnimationFrame(tick);
};
tick();
