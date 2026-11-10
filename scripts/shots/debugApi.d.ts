import type { DebugApi } from '@diagnostics';

declare global {
  interface Window {
    /** Set by the game in debug mode (`?debug`). */
    __aquobble: DebugApi;
  }
}
