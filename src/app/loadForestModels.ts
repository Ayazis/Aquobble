import type { GltfModelLoader } from '@rendering';
import type { Object3D } from 'three';

const PATH = 'assets/models/forest.glb';

/** Loads the forest pack (trees, bushes, ferns, logs). On failure the forest falls back to the simple trees. */
export async function loadForestModels(loader: GltfModelLoader): Promise<Object3D | null> {
  try {
    return await loader.load(PATH);
  } catch (error) {
    console.warn('Forest models failed to load; drawing the simple trees only.', error);
    return null;
  }
}
