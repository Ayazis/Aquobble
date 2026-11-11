import type { AnimatedModel } from '@player';
import type { GltfModelLoader } from '@rendering';

const CHARACTER_MODEL = 'assets/models/town/character.glb';

/** The rigged character, or null (capsules) if it fails to load. */
export async function loadCharacterModel(loader: GltfModelLoader): Promise<AnimatedModel | null> {
  try {
    return await loader.loadAnimated(CHARACTER_MODEL);
  } catch (error) {
    console.warn('Character model failed to load; using the capsule.', error);
    return null;
  }
}
