import type { System } from '@core';
import type { PostProcessing } from './PostProcessing';
import type { RenderContext } from './RenderContext';

/** Frame system: draws the frame. Always the last frame system. */
export class RenderSystem implements System {
  constructor(
    private readonly post: PostProcessing,
    private readonly context: RenderContext,
  ) {}

  update(): void {
    this.context.beginFrame();
    this.post.render();
  }
}
