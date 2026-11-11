import type { ModelPart } from './ModelPart';
import type { TreeSpecies } from './TreeSpecies';
import type { UnderstoryKind } from './UnderstoryKind';

/** The parts of every loaded forest model, by tree species or understory kind. Missing keys are not drawn. */
export type ForestModelSet = ReadonlyMap<TreeSpecies | UnderstoryKind, readonly ModelPart[]>;
