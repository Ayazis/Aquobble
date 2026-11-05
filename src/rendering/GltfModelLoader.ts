import type * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

/** Loads optimised glTF models from public/assets/ (meshopt-compressed by `npm run assets:use`). */
export class GltfModelLoader {
  private readonly loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

  /** `path` is relative to the site root, e.g. "assets/models/cookie.glb". */
  async load(path: string): Promise<THREE.Group> {
    const gltf = await this.loader.loadAsync(import.meta.env.BASE_URL + path);
    return gltf.scene;
  }
}
