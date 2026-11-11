import * as THREE from 'three';
import { SeededRandom } from '@core';
import { createHeightMapUniforms, HeightField } from '@terrain';
import { LilyPadFactory } from './LilyPadFactory';
import { seaGeometry } from './seaGeometry';
import { WaterMeshFactory } from './WaterMeshFactory';

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];
const ground = createHeightMapUniforms(new HeightField(2, 10, new Float32Array(4)));
const look = { waterColor: 0x2060a0, shallowColor: 0x80e0d0, opacity: 0.8 };
const normals = new THREE.DataTexture(new Uint8Array(4), 1, 1);

function compile(object: THREE.Object3D): Shader {
  const water = object.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
  const { vertexShader, fragmentShader } = THREE.ShaderLib.standard;
  const shader = { uniforms: {}, vertexShader, fragmentShader } as Shader;
  water.material.onBeforeCompile(shader, undefined as unknown as THREE.WebGLRenderer);
  return shader;
}

describe('seaGeometry', () => {
  it('reaches the full size with its vertices crowded into the middle', () => {
    const sea = seaGeometry(1000, 100);
    sea.computeBoundingBox();
    expect(sea.boundingBox?.max.x).toBeCloseTo(500);
    const x = sea.attributes.position;
    let inner = 0;
    for (let i = 0; i <= 100; i++) if (Math.abs(x.getX(i)) <= 150) inner++;
    expect(inner).toBeGreaterThan(65);
  });
});

describe('WaterMeshFactory', () => {
  it('gives the sea a swell and the shoreline shader, and keeps ponds calm', () => {
    const factory = new WaterMeshFactory(normals, look, ground);
    const sea = compile(factory.createSea().object);
    expect(sea.uniforms.uWaterSwell.value).toBeGreaterThan(0);
    expect(sea.uniforms.uWaterCalm.value).toBe(0);
    expect(sea.uniforms.uHeightMap).toBe(ground.uHeightMap);
    expect(sea.fragmentShader).toContain('float depth = vWaterPos.y - groundHeightAt(p);');
    expect(sea.fragmentShader).toContain('totalEmissiveRadiance += directionalLights[0].color * glint');
    expect(sea.vertexShader).toContain('transformed.z += swell;');
    const pond = compile(factory.createPond(4).object);
    expect(pond.uniforms.uWaterSwell.value).toBe(0);
    expect(pond.uniforms.uWaterCalm.value).toBe(1);
  });

  it('floats lily pads on ponds only, inside the bank', () => {
    const factory = new WaterMeshFactory(normals, look, ground, new LilyPadFactory(new SeededRandom(3)));
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
