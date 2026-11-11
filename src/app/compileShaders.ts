import type { RenderContext } from '@rendering';
import type { LoadingProgress } from '@menu';
import { loadingStage } from './loadingStage';

/** Compiles every material's shaders up front so the first frames after the loading screen don't stutter. */
export async function compileShaders(
  render: RenderContext,
  progress: LoadingProgress,
  fraction: number,
): Promise<void> {
  await loadingStage(progress, 'Compiling shaders', fraction);
  try {
    await render.renderer.compileAsync(render.scene, render.camera);
  } catch {
    // Not fatal: shaders then compile lazily on first draw.
  }
}
