import type { GltfModelLoader } from '@rendering';
import { DEFAULT_TOWN_LAYOUT, townAssetPath } from '@town';
import type { Object3D } from 'three';

/**
 * Loads one model per asset id used by the town layout, in parallel. A model that fails to load is left
 * out (with a warning), so its plots fall back to grey boxes instead of breaking the game.
 */
export async function loadTownModels(loader: GltfModelLoader): Promise<Map<string, Object3D>> {
  const { buildings, props } = DEFAULT_TOWN_LAYOUT;
  const ids = [...new Set([...buildings, ...props].map((plot) => plot.assetId))];
  const loaded = await Promise.all(
    ids.map(async (id) => {
      try {
        return [id, await loader.load(townAssetPath(id))] as const;
      } catch (error) {
        console.warn(`Town model "${id}" failed to load; using a placeholder box.`, error);
        return null;
      }
    }),
  );
  return new Map(loaded.filter((entry) => entry !== null));
}
