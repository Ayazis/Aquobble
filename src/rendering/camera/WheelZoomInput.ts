import type { SmoothZoom } from './SmoothZoom';

const LINE_HEIGHT_PX = 16;
const PAGE_HEIGHT_PX = 800;

/**
 * Routes mouse-wheel / trackpad scrolling into SmoothZoom. Listens in the capture phase and stops the
 * event, so OrbitControls never sees the wheel and never applies its own stepped zoom.
 */
export class WheelZoomInput {
  constructor(
    private readonly element: HTMLElement,
    private readonly zoom: SmoothZoom,
  ) {
    element.addEventListener('wheel', this.onWheel, { capture: true, passive: false });
  }

  dispose(): void {
    this.element.removeEventListener('wheel', this.onWheel, { capture: true });
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const unit =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? LINE_HEIGHT_PX
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? PAGE_HEIGHT_PX
          : 1;
    this.zoom.addWheel(event.deltaY * unit);
  };
}
