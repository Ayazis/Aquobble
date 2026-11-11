import type { LoadingProgress } from '@menu';

/** Reports a loading step, then waits for a painted frame so the loading screen shows it before heavy sync work. */
export async function loadingStage(progress: LoadingProgress, label: string, fraction: number): Promise<void> {
  progress.step(label, fraction);
  await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}
