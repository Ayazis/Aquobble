import * as THREE from 'three';
import { SeededRandom } from '@core';
import { createHeightMapUniforms, HeightField } from '@terrain';
import { GerstnerWaveField } from './GerstnerWaveField';
import { gerstnerWavesFromWind } from './gerstnerWavesFromWind';
import { LilyPadFactory } from './LilyPadFactory';
import { SEA_DENSE_HALF, seaGeometry } from './seaGeometry';
import { WaterMeshFactory } from './WaterMeshFactory';

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];
const ground = createHeightMapUniforms(new HeightField(2, 10, new Float32Array(4)));
const look = { waterColor: 0x2060a0, shallowColor: 0x80e0d0, opacity: 0.8 };
const map = new THREE.DataTexture(new Uint8Array(4), 1, 1);
const detail = { detailMap: map, foamMap: map, seaSegments: 40, fine: true, drawnLast: true };
const waves = new GerstnerWaveField(gerstnerWavesFromWind({ x: 1, z: 0 })).terms;

function compile(object: THREE.Object3D): Shader {
  const water = object.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
  const { vertexShader, fragmentShader } = THREE.ShaderLib.standard;
  const shader = { uniforms: {}, vertexShader, fragmentShader } as Shader;
  water.material.onBeforeCompile(shader, undefined as unknown as THREE.WebGLRenderer);
  return shader;
}

describe('seaGeometry', () => {
  it('reaches the full size with an even, close grid over the middle', () => {
    const sea = seaGeometry(1000, 100);
    sea.computeBoundingBox();
    expect(sea.boundingBox?.max.x).toBeCloseTo(500);
    const x = sea.attributes.position;
    let inner = 0;
    for (let i = 0; i <= 100; i++) if (Math.abs(x.getX(i)) <= SEA_DENSE_HALF + 1e-6) inner++;
    expect(inner).toBeGreaterThan(80);
    // Evenly spaced in the middle, each outer row longer than the last.
    expect(x.getX(51) - x.getX(50)).toBeCloseTo(x.getX(60) - x.getX(59), 4);
    expect(x.getX(100) - x.getX(99)).toBeGreaterThan(x.getX(99) - x.getX(98));
  });
});

describe('WaterMeshFactory', () => {
  it('gives the sea a swell, surf and the shoreline shader, and keeps ponds calm', () => {
    const factory = new WaterMeshFactory(detail, look, ground, undefined, waves);
    const sea = compile(factory.createSea().object);
    expect(sea.uniforms.uWaterSwell).toBe(factory.swell);
    expect(sea.uniforms.uWaterCalm.value).toBe(0);
    expect(sea.uniforms.uHeightMap).toBe(ground.uHeightMap);
    expect(sea.vertexShader).toContain('gerstnerOffset(waterWorld.xz');
    expect(sea.vertexShader).toContain('surfHeight(waterStill');
    for (const part of ['gerstnerSurface(vWaveRest', 'surfBore(', 'waterCaustics(', 'reflect(wToSurface, normal)']) {
      expect(sea.fragmentShader).toContain(part);
    }
    // Every hook into the material found its place (three.js renames chunks now and then).
    expect(sea.fragmentShader).toContain('material.specularColor = vec3(0.02');
    expect(sea.fragmentShader).toContain('reflectedLight.directSpecular = min(');
    expect(sea.fragmentShader).not.toContain('#include <normal_fragment_maps>');
    const pond = compile(factory.createPond(4).object);
    expect(pond.uniforms.uWaterSwell.value).toBe(0);
    expect(pond.uniforms.uWaterCalm.value).toBe(1);
  });

  it('moves the mesh only with the waves its vertices can carry', () => {
    const count = (segments: number) => {
      const factory = new WaterMeshFactory({ ...detail, seaSegments: segments }, look, ground, undefined, waves);
      const shader = compile(factory.createSea().object).vertexShader;
      return Number(/#define WAVE_MESH_COUNT (\d+)/.exec(shader)?.[1]);
    };
    expect(count(320)).toBeGreaterThan(count(100));
    expect(count(320)).toBeLessThanOrEqual(waves.length);
    expect(count(100)).toBeGreaterThanOrEqual(1);
  });

  it('floats lily pads on ponds only, inside the bank', () => {
    const factory = new WaterMeshFactory(detail, look, ground, new LilyPadFactory(new SeededRandom(3)));
    expect(factory.createSea().object.children).toHaveLength(1);
    const pads = factory.createPond(5).object.children[1] as THREE.InstancedMesh;
    expect(pads.count).toBeGreaterThanOrEqual(4);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    for (let i = 0; i < pads.count; i++) {
      pads.getMatrixAt(i, matrix);
      position.setFromMatrixPosition(matrix);
      expect(Math.hypot(position.x, position.z)).toBeLessThan(5 * 0.85);
      expect(position.y).toBeGreaterThan(0);
    }
  });
});
