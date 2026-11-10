/** True when the page was opened with `?debug` (FPS and render counters, time and camera controls). */
export function isDebugMode(search: string = typeof location === 'undefined' ? '' : location.search): boolean {
  return new URLSearchParams(search).has('debug');
}
