/** Schedules the next frame callback. Abstracted so the loop can be driven by tests. */
export interface FrameScheduler {
  request(callback: (timeMs: number) => void): number;
  cancel(id: number): void;
}
