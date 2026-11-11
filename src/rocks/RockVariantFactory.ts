import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Random } from '@core';
import { chiselRock } from './chiselRock';
import { ROCK_FAMILIES, type RockFamily } from './RockFamily';
import type { RockVariant, RockVariantSet } from './RockVariant';

/** Brightness of the buried base, easing up to 1 partway up the rock. */
const BASE_SHADE = 0.55;

/** Builds the unit-size rock shapes: chiselled lumps with a darkened base painted into the vertex colours. */
export class RockVariantFactory {
  constructor(private readonly random: Random) {}

  createSet(perFamily: number): RockVariantSet {
    const make = (family: RockFamily) => Array.from({ length: perFamily }, () => this.create(family));
    return Object.fromEntries(ROCK_FAMILIES.map((family) => [family, make(family)])) as RockVariantSet;
  }

  create(family: RockFamily): RockVariant {
    const geometry = this.shape(family);
    shadeBase(geometry);
    return { geometry, hull: distinctPoints(geometry.attributes.position.array as Float32Array) };
  }

  private shape(family: RockFamily): THREE.BufferGeometry {
    switch (family) {
      case 'boulder':
        return chiselRock(this.random, { detail: 2, cuts: 7 }).scale(1, 0.8, 1);
      case 'stone':
        return chiselRock(this.random, { detail: 1, cuts: 4 }).scale(1, 0.8, 1);
      case 'slab':
        return chiselRock(this.random, { detail: 2, cuts: 6, capAt: 0.34 }).scale(1.25, 1, 0.9);
      case 'pebbles':
        return this.pebbles();
    }
  }

  /** Four or five small stones within a metre of each other, each a third buried at y = 0. */
  private pebbles(): THREE.BufferGeometry {
    const stones = Array.from({ length: 4 + Math.floor(this.random.next() * 2) }, (_, i) => {
      const size = this.random.range(0.16, 0.36);
      const angle = this.random.range(0, Math.PI * 2);
      const distance = i === 0 ? 0 : this.random.range(0.35, 0.8);
      return chiselRock(this.random, { detail: 0, cuts: 2 })
        .scale(size, size * this.random.range(0.5, 0.8), size * this.random.range(0.7, 1))
        .rotateY(this.random.range(0, Math.PI))
        .translate(Math.cos(angle) * distance, size * 0.12, Math.sin(angle) * distance);
    });
    const merged = mergeGeometries(stones);
    for (const stone of stones) stone.dispose();
    merged.computeVertexNormals();
    return merged;
  }
}

/** Vertex colours: dark where the rock enters the ground, full colour from about halfway up. */
function shadeBase(geometry: THREE.BufferGeometry): void {
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox ?? new THREE.Box3();
  const positions = geometry.attributes.position;
  const colours = new Float32Array(positions.count * 3);
  for (let i = 0; i < positions.count; i++) {
    const t = Math.min(Math.max(((positions.getY(i) - min.y) / (max.y - min.y) - 0.2) / 0.4, 0), 1);
    colours.fill(BASE_SHADE + (1 - BASE_SHADE) * t * t * (3 - 2 * t), i * 3, i * 3 + 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
}

function distinctPoints(positions: Float32Array): Float32Array {
  const seen = new Map<string, number[]>();
  for (let i = 0; i < positions.length; i += 3) {
    const point = [positions[i], positions[i + 1], positions[i + 2]];
    seen.set(point.map((v) => v.toFixed(3)).join(','), point);
  }
  return Float32Array.from([...seen.values()].flat());
}
