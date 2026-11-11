/** Component: a walking character's tuning and vertical motion state. */
export interface Player {
  walkSpeed: number;
  runSpeed: number;
  jumpSpeed: number;
  gravity: number;
  verticalVelocity: number;
  /** Horizontal velocity of the last move (m/s), read by presentation to animate and face the model. */
  moveX: number;
  moveZ: number;
  grounded: boolean;
  /** Full height (m), for wading and swimming depths. Set at spawn. */
  height: number;
  /** Floating in deep water. */
  swimming: boolean;
}

export const DEFAULT_PLAYER: Player = {
  walkSpeed: 4,
  runSpeed: 8,
  jumpSpeed: 7,
  gravity: 20,
  verticalVelocity: 0,
  moveX: 0,
  moveZ: 0,
  grounded: false,
  height: 1.8,
  swimming: false,
};

declare module '@core/ecs/Entity' {
  interface Entity {
    player?: Player;
  }
}
