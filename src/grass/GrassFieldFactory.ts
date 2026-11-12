import * as THREE from 'three';
import { createGroundShadeUniforms, type GroundShadeUniforms, type HeightMapUniforms } from '@terrain';
import { applyGrassBladeShader } from './applyGrassBladeShader';
import type { GrassBand } from './GrassBand';
import { grassBladeGeometry } from './grassBladeGeometry';
import type { GrassDensityUniforms } from './GrassDensityUniforms';
import type { GrassTileSet } from './GrassTileSet';
import { tileSpan } from './visibleGrassTiles';
import type { WindSway } from './WindSway';

/** The grass field's three.js object and, per band, the tiles `GrassTileSystem` fills in each frame. */
export interface GrassField {
  object: THREE.Group;
  tiles: GrassTileSet[];
}

/**
 * Builds the grass field: one instanced draw per distance band, every instance a single blade that the vertex
 * shader grows on the tile it belongs to (see `grassBladeVertex`). There is no per-blade data on the CPU, only
 * a short list of tile corners per band, so the field follows the camera for free.
 */
export class GrassFieldFactory {
  constructor(
    private readonly density: GrassDensityUniforms,
    private readonly heightMap: HeightMapUniforms,
    private readonly shade: GroundShadeUniforms = createGroundShadeUniforms(),
  ) {}

  create(bands: readonly GrassBand[], wind: WindSway): GrassField {
    const object = new THREE.Group();
    const tiles = bands.map((band) => {
      const { mesh, set } = this.band(band, wind);
      object.add(mesh);
      return set;
    });
    return { object, tiles };
  }

  private band(band: GrassBand, wind: WindSway): { mesh: THREE.Mesh; set: GrassTileSet } {
    const blade = grassBladeGeometry(band.segments);
    const geometry = new THREE.InstancedBufferGeometry().copy(blade as THREE.InstancedBufferGeometry);
    blade.dispose();
    const origins = new Float32Array(tileSpan(band) ** 2 * 2);
    const attribute = new THREE.InstancedBufferAttribute(origins, 2, false, band.side * band.side);
    attribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('aTile', attribute);
    geometry.instanceCount = 0;
    const material = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, side: THREE.DoubleSide });
    // The wind and bend map are swapped for the shared ones after creation, so read them at compile time.
    applyGrassBladeShader(material, band, () => ({
      ...this.density,
      ...this.heightMap,
      ...this.shade,
      ...wind.wind,
      ...wind.bend,
    }));
    const mesh = new THREE.Mesh(geometry, material);
    // Blades are placed in the shader, so the mesh has no useful bounds of its own.
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    return { mesh, set: { band, origins, attribute, geometry } };
  }
}
