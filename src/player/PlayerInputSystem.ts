import type { GameWorld, System } from '@core';
import type { KeyboardState } from './KeyboardState';
import type {} from './PlayerInput';

const axis = (keys: KeyboardState, negative: string[], positive: string[]): number =>
  (positive.some((k) => keys.isHeld(k)) ? 1 : 0) - (negative.some((k) => keys.isHeld(k)) ? 1 : 0);

/** Fixed system: maps keyboard state (WASD, shift, space) onto each PlayerInput. Nothing else. */
export class PlayerInputSystem implements System {
  private readonly players;

  constructor(
    world: GameWorld,
    private readonly keys: KeyboardState,
  ) {
    this.players = world.with('playerInput');
  }

  update(): void {
    const jumpPressed = this.keys.consumePress('Space');
    for (const { playerInput } of this.players) {
      playerInput.forward = axis(this.keys, ['KeyS', 'ArrowDown'], ['KeyW', 'ArrowUp']);
      playerInput.right = axis(this.keys, ['KeyA', 'ArrowLeft'], ['KeyD', 'ArrowRight']);
      playerInput.run = this.keys.isHeld('ShiftLeft') || this.keys.isHeld('ShiftRight');
      if (jumpPressed) playerInput.jump = true;
    }
  }
}
