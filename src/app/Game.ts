import type { GameLoop } from '@core';

/** A running game. Created by `bootstrap`. */
export class Game {
  constructor(
    private readonly loop: GameLoop,
    private readonly disposables: readonly { dispose(): void }[],
  ) {}

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
    for (const d of this.disposables) d.dispose();
  }
}
