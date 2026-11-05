import type { System } from '@core';
import type { PostProcessing } from './PostProcessing';

/** Frame system: draws the frame. Always the last frame system. */
export class RenderSystem implements System {
  constructor(private readonly post: PostProcessing) {}

  update(): void {
    this.post.render();
  }
}
