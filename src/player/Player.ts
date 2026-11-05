/** Component: a walking character's tuning and vertical motion state. */
export interface Player {
  walkSpeed: number;
  runSpeed: number;
  jumpSpeed: number;
  gravity: number;
  verticalVelocity: number;
  grounded: boolean;
}

export const DEFAULT_PLAYER: Player = {
  walkSpeed: 4,
  runSpeed: 8,
  jumpSpeed: 7,
  gravity: 20,
  verticalVelocity: 0,
  grounded: false,
};

declare module '@core/ecs/Entity' {
  interface Entity {
    player?: Player;
  }
}
