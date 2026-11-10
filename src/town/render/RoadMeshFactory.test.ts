import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { DEFAULT_TOWN_LAYOUT } from '../layout/defaultTownLayout';
import { NO_LANE } from './groundPatch';
import { RoadMeshFactory } from './RoadMeshFactory';

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];

function build(kinds: string[] = []) {
  const factory = new RoadMeshFactory({ apply: (_material, kind) => void kinds.push(kind) });
  const meshes = factory.create(DEFAULT_TOWN_LAYOUT).children as THREE.Mesh[];
  return { plaza: meshes[0], roads: meshes[1], count: meshes.length };
}

const verge = (mesh: THREE.Mesh) => mesh.geometry.getAttribute('verge');
const position = (mesh: THREE.Mesh) => mesh.geometry.getAttribute('position');

describe('RoadMeshFactory', () => {
  it('draws the square as cobble and all roads as one dirt mesh', () => {
    const kinds: string[] = [];
    const { plaza, roads, count } = build(kinds);
    expect(count).toBe(2);
    expect(kinds).toEqual(['cobble', 'dirt']);
    expect(plaza.material).not.toBe(roads.material);
  });

  it('gives the square zero cover on its rim, full cover inside and no ruts', () => {
    const { plaza } = build();
    const p = DEFAULT_TOWN_LAYOUT.plazaHalfSize;
    for (let i = 0; i < verge(plaza).count; i++) {
      const edge = p - Math.max(Math.abs(position(plaza).getX(i)), Math.abs(position(plaza).getZ(i)));
      if (edge < 1e-6) expect(verge(plaza).getX(i)).toBeCloseTo(0);
      if (edge > 1) expect(verge(plaza).getX(i)).toBe(1);
      expect(verge(plaza).getY(i)).toBe(NO_LANE);
    }
  });

  it('frays only the long sides of a road and measures the lane from its centreline', () => {
    const { roads } = build();
    const half = DEFAULT_TOWN_LAYOUT.roads[0].width / 2;
    let checked = 0;
    for (let i = 0; i < verge(roads).count; i++) {
      const x = position(roads).getX(i);
      const z = position(roads).getZ(i);
      if (z < DEFAULT_TOWN_LAYOUT.plazaHalfSize) continue; // the road that runs along +z
      checked++;
      expect(verge(roads).getY(i)).toBeCloseTo(x);
      expect(verge(roads).getX(i)).toBeCloseTo(Math.min(1, (half - Math.abs(x)) / 0.7));
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('runs each road in under the square', () => {
    const { roads } = build();
    const box = new THREE.Box3().setFromBufferAttribute(position(roads) as THREE.BufferAttribute);
    const p = DEFAULT_TOWN_LAYOUT.plazaHalfSize;
    const wall = DEFAULT_TOWN_LAYOUT.wall.halfSize;
    expect([box.min.x, box.max.x, box.min.z, box.max.z]).toEqual([-wall, wall, -wall, wall]);
    let inside = 0;
    for (let i = 0; i < position(roads).count; i++) {
      if (Math.max(Math.abs(position(roads).getX(i)), Math.abs(position(roads).getZ(i))) < p - 1) inside++;
    }
    expect(inside).toBeGreaterThan(0);
  });

  it('patches the shader to cut the frayed edge, after the surface styler ran', () => {
    const { roads } = build();
    const material = roads.material as THREE.Material;
    const shader = {
      uniforms: {},
      vertexShader: '#include <common>\n#include <begin_vertex>',
      fragmentShader: '#include <common>\n#include <color_fragment>',
    } as Shader;
    material.onBeforeCompile(shader, undefined as unknown as THREE.WebGLRenderer);
    expect(shader.vertexShader).toContain('attribute vec2 verge;');
    expect(shader.fragmentShader).toContain('discard;');
    expect(material.customProgramCacheKey()).toContain('aquobble-verge');
  });
});
