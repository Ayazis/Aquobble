import type { Object3D } from 'three';

/** Component: the three.js object that represents this entity on screen. */
export interface RenderObject {
  object: Object3D;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    renderObject?: RenderObject;
  }
}
