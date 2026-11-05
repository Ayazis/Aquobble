import type { BodyHandle } from './BodyHandle';
import type { CharacterHandle } from './CharacterHandle';

/** Component: a character-controlled kinematic body. `body` also works with readPose and ray exclusion. */
export interface CharacterBody {
  body: BodyHandle;
  controller: CharacterHandle;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    characterBody?: CharacterBody;
  }
}
