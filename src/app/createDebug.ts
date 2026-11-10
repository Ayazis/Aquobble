import type { System } from '@core';
import {
  DebugCamera,
  DebugTools,
  FpsCounter,
  FpsOverlay,
  FpsSystem,
  type DebugClock,
  type DebugKeys,
} from '@diagnostics';
import type { PhysicsEngine } from '@physics';
import type { RenderContext } from '@rendering';

const PROBE_FROM = 500;

/** The debug-mode systems, or nothing at all for players. */
export interface DebugParts {
  /** Run right after the game's camera system, so a held debug camera wins. */
  afterCamera: System[];
  /** Run after the frame is drawn. */
  afterRender: System[];
  disposables: { dispose(): void }[];
}

/** With `?debug`: FPS and draw counters, time-of-day and camera controls, and `window.__aquobble`. */
export function createDebug(
  enabled: boolean,
  container: HTMLElement,
  render: RenderContext,
  clock: DebugClock,
  keys: DebugKeys,
  physics: PhysicsEngine,
): DebugParts {
  if (!enabled) return { afterCamera: [], afterRender: [], disposables: [] };
  const groundHeight = (x: number, z: number): number | null => {
    const hit = physics.castRay({ x, y: PROBE_FROM, z }, { x: 0, y: -1, z: 0 }, PROBE_FROM * 2);
    return hit === null ? null : PROBE_FROM - hit;
  };
  const overlay = new FpsOverlay(container);
  return {
    afterCamera: [new DebugTools(clock, new DebugCamera(render.camera), keys, render, groundHeight)],
    afterRender: [new FpsSystem(new FpsCounter(), overlay, render)],
    disposables: [overlay],
  };
}
