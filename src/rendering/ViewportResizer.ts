import type { PostProcessing } from './PostProcessing';
import type { RenderContext } from './RenderContext';

/** Keeps renderer, camera and post-processing sized to the window. */
export class ViewportResizer {
  constructor(
    private readonly context: RenderContext,
    private readonly post: PostProcessing,
  ) {
    addEventListener('resize', this.onResize);
  }

  dispose(): void {
    removeEventListener('resize', this.onResize);
  }

  private readonly onResize = (): void => {
    const { camera, renderer } = this.context;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    this.post.setSize(innerWidth, innerHeight);
  };
}
