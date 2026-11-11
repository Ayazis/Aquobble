/** Reports loading steps to a loading screen. `fraction` is overall progress, 0..1. */
export interface LoadingProgress {
  step(label: string, fraction: number): void;
}

/** Progress sink that ignores everything (tests, headless use). */
export const NO_PROGRESS: LoadingProgress = { step: () => undefined };
