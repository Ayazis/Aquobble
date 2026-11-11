import type { Entity, GameWorld, System } from '@core';
import * as THREE from 'three';
import type {} from '@rendering';
import type {} from '@water';
import {
  WET_FRAGMENT_COLOR,
  WET_FRAGMENT_PARS,
  WET_FRAGMENT_ROUGHNESS,
  WET_VERTEX_MAIN,
  WET_VERTEX_PARS,
} from './wetLookChunks';

interface WetUniforms {
  uWetLine: { value: number };
  uWetAmount: { value: number };
}

/**
 * Frame system (2.11): gives each wet character its own copy of its standard materials (once, on first
 * wetting) with a wet line in world height, then feeds the line and how wet it still is from `Wetness`.
 * Earlier shader patches (the character rim) keep running first.
 */
export class WetLookSystem implements System {
  private readonly wet;
  private readonly patched = new WeakMap<Entity, WetUniforms>();

  constructor(world: GameWorld) {
    this.wet = world.with('wetness', 'renderObject');
  }

  update(): void {
    for (const entity of this.wet) {
      let uniforms = this.patched.get(entity);
      if (!uniforms) {
        uniforms = { uWetLine: { value: -1e6 }, uWetAmount: { value: 0 } };
        patchTree(entity.renderObject.object, uniforms);
        this.patched.set(entity, uniforms);
      }
      uniforms.uWetLine.value = entity.wetness.feetY + entity.wetness.line;
      uniforms.uWetAmount.value = entity.wetness.amount;
    }
  }
}

function patchTree(root: THREE.Object3D, uniforms: WetUniforms): void {
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    if (Array.isArray(node.material)) node.material = node.material.map((m) => wetCopy(m, uniforms));
    else node.material = wetCopy(node.material, uniforms);
  });
}

function wetCopy(material: THREE.Material, uniforms: WetUniforms): THREE.Material {
  if (!(material instanceof THREE.MeshStandardMaterial)) return material;
  const copy = material.clone();
  const inner = material.onBeforeCompile;
  const innerKey = material.customProgramCacheKey();
  copy.onBeforeCompile = (shader, renderer) => {
    inner.call(copy, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WET_VERTEX_PARS}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\n${WET_VERTEX_MAIN}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${WET_FRAGMENT_PARS}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${WET_FRAGMENT_COLOR}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${WET_FRAGMENT_ROUGHNESS}`);
  };
  copy.customProgramCacheKey = () => `${innerKey}|aquobble-wet`;
  return copy;
}
