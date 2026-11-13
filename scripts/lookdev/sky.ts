// Look-dev page for the sky and lighting: the real render pipeline over a bare ground with test objects.
import * as THREE from 'three';
import { SeededRandom } from '@core';
import { DEFAULT_ENVIRONMENT, Environment } from '@environment';
import { installSceneLighting, PostProcessing, RenderContext } from '@rendering';

const params = new URLSearchParams(location.search);
const container = document.getElementById('app') as HTMLElement;
const render = new RenderContext(container);
const post = new PostProcessing(render);
const lighting = installSceneLighting(true);
const env = new Environment({
  ...DEFAULT_ENVIRONMENT,
  dayLengthSeconds: 0,
  startTimeOfDay: Number(params.get('t') ?? 0.5),
});
const dayNight = env.install(render, new SeededRandom(1), post, lighting.cloudShadow);
dayNight.overcast = Number(params.get('overcast') ?? 0);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0x4f7a34, roughness: 0.9 }),
);
ground.receiveShadow = true;
render.scene.add(ground);
const swatches = [0xffffff, 0x808080, 0x7fc24a, 0xb5523b, 0xead9a0, 0x222222];
swatches.forEach((color, i) => {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 24),
    new THREE.MeshStandardMaterial({ color, roughness: i === 5 ? 0.15 : 0.8 }),
  );
  ball.position.set((i - 2.5) * 2.6, 1, -8);
  ball.castShadow = ball.receiveShadow = true;
  render.scene.add(ball);
});
const yaw = (Number(params.get('yaw') ?? 0) * Math.PI) / 180;
const pitch = (Number(params.get('pitch') ?? 8) * Math.PI) / 180;
render.camera.position.set(0, 1.7, 0);
render.camera.lookAt(
  Math.sin(yaw) * Math.cos(pitch) * 10,
  1.7 + Math.sin(pitch) * 10,
  -Math.cos(yaw) * Math.cos(pitch) * 10,
);
let frame = 0;
const tick = () => {
  dayNight.update(1 / 60);
  render.beginFrame();
  post.render();
  (window as unknown as { __frame: number }).__frame = ++frame;
  requestAnimationFrame(tick);
};
tick();
