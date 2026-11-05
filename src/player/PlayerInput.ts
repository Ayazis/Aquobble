/** Component: what the player is asking for this step. Written by PlayerInputSystem, read by movement. */
export interface PlayerInput {
  /** -1 (back) .. 1 (forward). */
  forward: number;
  /** -1 (left) .. 1 (right). */
  right: number;
  run: boolean;
  /** Latched on key press; cleared by CharacterMovementSystem when it consumes it. */
  jump: boolean;
}

export const idleInput = (): PlayerInput => ({ forward: 0, right: 0, run: false, jump: false });

declare module '@core/ecs/Entity' {
  interface Entity {
    playerInput?: PlayerInput;
  }
}
