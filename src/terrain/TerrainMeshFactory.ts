import * as THREE from 'three';
import { createGroundShadeUniforms, type GroundShadeUniforms } from './GroundShadeUniforms';
import type { HeightField } from './HeightField';
import type { TerrainGroundHook } from './TerrainGroundHook';
import { TerrainMaterialFactory } from './TerrainMaterialFactory';
import { TerrainTextureLoader } from './TerrainTextureLoader';
import { createTerrainTextureUniforms } from './TerrainTextureUniforms';

/**
 * Builds the smooth-shaded terrain mesh from a height field. Colours are blended per pixel in the shader and tinted with detail textures (blended by height and slope) once those load in the background.
 */
export class TerrainMeshFactory {
  constructor(
    private readonly materials = new TerrainMaterialFactory(),
    private readonly textures: TerrainTextureLoader | null = new TerrainTextureLoader(),
    private readonly shade: GroundShadeUniforms = createGroundShadeUniforms(),
    /** World height of the sea, for the wet band on the sand; none if unset. */
    private readonly waterLevel?: number,
    /** lane B: grass. Extra ground shading (the far grass fur). */
    private readonly hook?: TerrainGroundHook,
  ) {}

  create(field: HeightField): THREE.Mesh {
    const segments = field.samples - 1;
    // PlaneGeometry vertices are row-major from -z to +z after rotation, matching HeightField.
    const geometry = new THREE.PlaneGeometry(field.size, field.size, segments, segments).rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setY(i, field.heights[i]);
    // Shared vertices: the normals average across faces, so the hills are lit as smooth ground.
    geometry.computeVertexNormals();

    const uniforms = createTerrainTextureUniforms(this.waterLevel);
    const material = this.materials.create({ ...uniforms, ...this.shade }, this.hook);
    this.textures?.load(uniforms);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}
