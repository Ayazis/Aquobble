import * as THREE from 'three';
import { createGroundShadeUniforms, type GroundShadeUniforms, type HeightMapUniforms } from '@terrain';
import { applyGroundBlend } from './applyGroundBlend';
import type { GrassBand } from './GrassBand';
import { grassCardGeometry } from './grassCardGeometry';
import type { GrassDensityUniforms } from './GrassDensityUniforms';
import { GRASS_FIELD_PARS, grassFieldVertex } from './grassFieldGlsl';
import { grassTuftGeometry } from './grassTuftGeometry';
import type { WindSway } from './WindSway';
import { WIND_UNIFORMS } from './windShaderChunk';

/**
 * Builds the grass field: one instanced draw per distance band, each a grid of identical tuft patches that the
 * vertex shader places round the camera (see `grassFieldVertex`). There is no per-tuft data on the CPU: the
 * tile grid moves with the camera in the shader, so tiles recycle themselves.
 */
export class GrassFieldFactory {
  constructor(
    private readonly density: GrassDensityUniforms,
    private readonly heightMap: HeightMapUniforms,
    private readonly shade: GroundShadeUniforms = createGroundShadeUniforms(),
  ) {}

  create(bands: readonly GrassBand[], wind: WindSway): THREE.Group {
    const group = new THREE.Group();
    bands.forEach((band, i) => group.add(this.band(band, wind, i)));
    return group;
  }

  private band(band: GrassBand, wind: WindSway, index: number): THREE.Mesh {
    const shape = band.shape;
    const tuft =
      shape.kind === 'blades' ? grassTuftGeometry(shape.blades, shape.halfWidth) : grassCardGeometry(shape.halfWidth);
    const geometry = new THREE.InstancedBufferGeometry().copy(tuft as THREE.InstancedBufferGeometry);
    geometry.instanceCount = band.grid * band.grid * band.side * band.side;
    tuft.dispose();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    const key = `aquobble-grass-field-${index}-${JSON.stringify(band)}`;
    material.customProgramCacheKey = () => key;
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.density, this.heightMap);
      shader.uniforms.uWindTime = wind.time;
      shader.uniforms.uBenders = wind.benders;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${WIND_UNIFORMS}\n${GRASS_FIELD_PARS}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${grassFieldVertex(band)}`);
    };
    // Adds the ground colour helpers, the two-sided lighting fix and the glow through the blades.
    applyGroundBlend(material, { tipFadeStart: 1e4, tipFadeEnd: 2e4, shade: this.shade });
    const mesh = new THREE.Mesh(geometry, material);
    // Tufts are placed in the shader, so the mesh has no useful bounds of its own.
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    return mesh;
  }
}
