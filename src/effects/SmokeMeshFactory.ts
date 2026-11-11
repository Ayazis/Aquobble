import * as THREE from 'three';
import type { SmokeConfig } from './SmokeConfig';
import { SMOKE_FADE_ATTRIBUTE } from './smokeFadeAttribute';

/**
 * Builds the single InstancedMesh holding every smoke puff: a flat-shaded icosahedron (20 triangles), Lambert,
 * transparent with a per-instance alpha, no shadows, no depth writes. One draw call for the whole town.
 */
export class SmokeMeshFactory {
  create(count: number, config: SmokeConfig): THREE.InstancedMesh {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const fade = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    fade.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute(SMOKE_FADE_ATTRIBUTE, fade);

    const material = new THREE.MeshLambertMaterial({
      color: config.color,
      flatShading: true,
      transparent: true,
      depthWrite: false,
    });
    const name = SMOKE_FADE_ATTRIBUTE;
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float ' + name + ';\nvarying float vFade;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFade = ' + name + ';');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vFade;')
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vFade;');
    };

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.name = 'chimney-smoke';
    // Puffs are spread over the whole town; keeping a bounding volume current is not worth it for one draw.
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 1;
    return mesh;
  }
}
