import { KeyboardState, LanternButton, TouchControls } from '@player';
import { DEFAULT_SMOOTH_ZOOM, PointerLookInput, SmoothZoom, WheelZoomInput, type RenderContext } from '@rendering';

/** Keyboard, pointer look, wheel zoom, the lantern button and (on phones) the touch controls. */
export interface InstalledInput {
  keys: KeyboardState;
  look: PointerLookInput;
  zoom: SmoothZoom;
  wheel: WheelZoomInput;
  lanternButton: LanternButton;
  touch?: TouchControls;
}

export function installInput(
  container: HTMLElement,
  render: RenderContext,
  distances: { minCameraDistance: number; maxCameraDistance: number },
  mobile: boolean,
): InstalledInput {
  const keys = new KeyboardState();
  const look = new PointerLookInput(render.canvas);
  const { minCameraDistance: minDistance, maxCameraDistance: maxDistance } = distances;
  const zoom = new SmoothZoom({ ...DEFAULT_SMOOTH_ZOOM, minDistance, maxDistance });
  const wheel = new WheelZoomInput(render.canvas, zoom);
  return {
    keys,
    look,
    zoom,
    wheel,
    lanternButton: new LanternButton(container),
    touch: mobile ? new TouchControls(container) : undefined,
  };
}
