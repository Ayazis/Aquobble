import type { GameWorld, System } from '@core';
import type { KeyboardState } from './KeyboardState';
import type { TouchControls } from './TouchControls';
import type {} from './PlayerInput';

const axis = (keys: KeyboardState, negative: string[], positive: string[]): number =>
  (positive.some((k) => keys.isHeld(k)) ? 1 : 0) - (negative.some((k) => keys.isHeld(k)) ? 1 : 0);

/** Fixed system: maps keyboard state (WASD, shift, space) and optional touch controls onto each PlayerInput. Nothing else. */
export class PlayerInputSystem implements System {
  private readonly players;

  constructor(
    world: GameWorld,
    private readonly keys: KeyboardState,
    private readonly touch?: TouchControls,
  ) {
    this.players = world.with('playerInput');
  }

  update(): void {
    const touchJump = this.touch?.consumeJump() ?? false;
    const jumpPressed = this.keys.consumePress('Space') || touchJump;
    for (const { playerInput } of this.players) {
      playerInput.forward = axis(this.keys, ['KeyS', 'ArrowDown'], ['KeyW', 'ArrowUp']);
      playerInput.right = axis(this.keys, ['KeyA', 'ArrowLeft'], ['KeyD', 'ArrowRight']);
      playerInput.run = this.keys.isHeld('ShiftLeft') || this.keys.isHeld('ShiftRight');
      if (this.touch && (this.touch.forward !== 0 || this.touch.right !== 0)) {
        playerInput.forward = this.touch.forward;
        playerInput.right = this.touch.right;
        playerInput.run = this.touch.run;
      }
      if (jumpPressed) playerInput.jump = true;
    }
  }
}
