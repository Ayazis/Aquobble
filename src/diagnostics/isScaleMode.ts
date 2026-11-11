/** True with `?debug&scale`: the scale overlay (1 m grid, 1.8 m figure, door-height markers) is drawn. */
export function isScaleMode(search: string = typeof location === 'undefined' ? '' : location.search): boolean {
  const params = new URLSearchParams(search);
  return params.has('debug') && params.has('scale');
}
