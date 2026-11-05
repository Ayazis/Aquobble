import type { BodyHandle } from '@physics';

/**
 * Component: the entity the third-person camera follows. The camera writes `yaw` back each frame so
 * movement can be made relative to where the camera looks.
 */
export interface CameraTarget {
  /** Height above the entity's origin that the camera looks at. */
  height: number;
  /** Camera yaw in radians; 0 looks along -z. Written by ThirdPersonCameraSystem. */
  yaw: number;
  /** Body the camera's collision ray ignores (usually the target's own body). */
  ignoreBody?: BodyHandle;
}

declare module '@core/ecs/Entity' {
  interface Entity {
    cameraTarget?: CameraTarget;
  }
}
