import * as THREE from 'three';
import type { HeightField } from './HeightField';
import { colorForHeight } from './TerrainPalette';

/** Builds the flat-shaded, per-face coloured terrain mesh from a height field. */
export class TerrainMeshFactory {
  create(field: HeightField): THREE.Mesh {
    const segments = field.samples - 1;
    // PlaneGeometry vertices are row-major from -z to +z after rotation, matching HeightField.
    const indexed = new THREE.PlaneGeometry(field.size, field.size, segments, segments).rotateX(-Math.PI / 2);
    const positions = indexed.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setY(i, field.heights[i]);

    const geometry = indexed.toNonIndexed();
    indexed.dispose();
    geometry.setAttribute('color', this.faceColors(geometry));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private faceColors(geometry: THREE.BufferGeometry): THREE.BufferAttribute {
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i += 3) {
      const height = (positions.getY(i) + positions.getY(i + 1) + positions.getY(i + 2)) / 3;
      color.setHex(colorForHeight(height));
      for (let k = 0; k < 3; k++) color.toArray(colors, (i + k) * 3);
    }
    return new THREE.BufferAttribute(colors, 3);
  }
}
