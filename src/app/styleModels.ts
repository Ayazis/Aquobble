import type { Object3D } from 'three';
import { ModelMaterialStyler, SurfaceDetailLibrary } from '@rendering';
import type { AnimatedModel } from '@player';

/** One shared look for every model: matte materials, plus surface detail on the static town models where affordable. */
export function styleModels(
  town: ReadonlyMap<string, Object3D>,
  character: AnimatedModel | null,
  detail: boolean,
): SurfaceDetailLibrary {
  // With no sources the library leaves every material flat: cheaper shaders for phones.
  const surfaces = new SurfaceDetailLibrary(detail ? undefined : {});
  const styler = new ModelMaterialStyler(surfaces);
  for (const model of town.values()) styler.style(model, true);
  if (character) styler.style(character.scene, false);
  surfaces.load();
  return surfaces;
}
