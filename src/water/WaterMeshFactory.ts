import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import type { WaterLook } from './WaterLook';
import type { WaterMesh } from './WaterMesh';

/** Reflective three.js `Water` with scrolling normals, as a square sea or a round pond. */
export class WaterMeshFactory {
  constructor(
    private readonly normals: THREE.Texture,
    private readonly look: WaterLook,
  ) {}

  /** Square sea plane of side `size`. */
  createSea(size = 1000): WaterMesh {
    return this.build(new THREE.PlaneGeometry(size, size), 512);
  }

  /** Disc of `radius` for a pond; lower-resolution reflection. */
  createPond(radius: number): WaterMesh {
    return this.build(new THREE.CircleGeometry(radius, 32), 256);
  }

  private build(geometry: THREE.BufferGeometry, textureSize: number): WaterMesh {
    const { sunDirection: s, sunColor, waterColor, distortionScale } = this.look;
    const water = new Water(geometry, {
      textureWidth: textureSize,
      textureHeight: textureSize,
      waterNormals: this.normals,
      sunDirection: new THREE.Vector3(s.x, s.y, s.z).normalize(),
      sunColor,
      waterColor,
      distortionScale,
      fog: true,
    });
    // Water reflects about its local +z, so it stays an XY plane rotated flat inside a group that
    // TransformSyncSystem is free to move.
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    const object = new THREE.Group().add(water);
    const { time, sunDirection } = water.material.uniforms;
    return { object, surface: { time, sunDirection } } as WaterMesh;
  }
}
