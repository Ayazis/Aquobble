import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshLambertMaterial,
} from 'three';
import type { Bird } from './Bird';

/** Shared clock for the wing-flap shader. `BirdRenderSystem` advances it. */
export interface FlapClock {
  value: number;
}

/**
 * Builds one InstancedMesh per flock: a tiny V of two triangles (body along -z, wings along ±x).
 * The vertex shader lifts wing tips with a sine so every bird flaps without CPU work.
 */
export class BirdMeshFactory {
  readonly clock: FlapClock = { value: 0 };
  private readonly geometry = birdGeometry();
  private readonly material = flapMaterial(this.clock);

  create(birds: readonly Bird[]): InstancedMesh {
    const geometry = this.geometry.clone();
    const phases = new Float32Array(birds.map((b) => b.flapPhase));
    geometry.setAttribute('flapPhase', new InstancedBufferAttribute(phases, 1));
    const mesh = new InstancedMesh(geometry, this.material, birds.length);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    return mesh;
  }
}

function birdGeometry(): BufferGeometry {
  const span = 0.55;
  // prettier-ignore
  const positions = [
    0, 0, 0.25,   -span, 0, -0.1,   0, 0, -0.2,
    0, 0, 0.25,    0, 0, -0.2,       span, 0, -0.1,
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function flapMaterial(clock: FlapClock): MeshLambertMaterial {
  const material = new MeshLambertMaterial({ color: 0x2b2b30, side: DoubleSide });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.flapTime = clock;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float flapPhase;\nuniform float flapTime;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed.y += sin(flapTime * 9.0 + flapPhase) * abs(transformed.x) * 0.9;',
      );
  };
  return material;
}
