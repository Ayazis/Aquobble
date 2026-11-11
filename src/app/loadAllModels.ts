import { GltfModelLoader } from '@rendering';
import type { LoadingProgress } from '@menu';
import { loadCharacterModel } from './loadCharacterModel';
import { loadForestModels } from './loadForestModels';
import { loadTownModels } from './loadTownModels';

/** Loads every glTF model in parallel, mapping file progress onto `from..to` of the loading bar. */
export async function loadAllModels(progress: LoadingProgress, from: number, to: number) {
  const loader = new GltfModelLoader((loaded, total) =>
    progress.step(`Loading models (${loaded}/${total})`, from + ((to - from) * loaded) / Math.max(1, total)),
  );
  progress.step('Loading models', from);
  const [townModels, characterModel, forestPack] = await Promise.all([
    loadTownModels(loader),
    loadCharacterModel(loader),
    loadForestModels(loader),
  ]);
  return { loader, townModels, characterModel, forestPack };
}
