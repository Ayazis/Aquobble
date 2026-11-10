import * as THREE from 'three';
import type { HeightField } from './HeightField';
import { TerrainMaterialFactory } from './TerrainMaterialFactory';
import { TerrainTextureLoader } from './TerrainTextureLoader';
import { createTerrainTextureUniforms } from './TerrainTextureUniforms';

/**
 * Builds the flat-shaded terrain mesh from a height field. Colours are blended per pixel in the shader and tinted with detail textures (blended by height and slope) once those load in the background.
 */
export class TerrainMeshFactory {
  constructor(
    private readonly materials = new TerrainMaterialFactory(),
    private readonly textures: TerrainTextureLoader | null = new TerrainTextureLoader(),
  ) {}

  create(field: HeightField): THREE.Mesh {
    const segments = field.samples - 1;
    // PlaneGeometry vertices are row-major from -z to +z after rotation, matching HeightField.
    const indexed = new THREE.PlaneGeometry(field.size, field.size, segments, segments).rotateX(-Math.PI / 2);
    const positions = indexed.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setY(i, field.heights[i]);

    const geometry = indexed.toNonIndexed();
    indexed.dispose();
    geometry.computeVertexNormals();

    const uniforms = createTerrainTextureUniforms();
    const material = this.materials.create(uniforms);
    this.textures?.load(uniforms);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}
