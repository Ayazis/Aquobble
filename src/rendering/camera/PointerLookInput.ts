/** Touch drags are smaller than mouse sweeps for the same intended turn. */
const TOUCH_SCALE = 1.6;

/**
 * Camera look input. Mouse: locks the pointer on canvas click and accumulates movement while locked.
 * Touch: one finger dragging on the canvas (touches on HUD controls never reach it).
 */
export class PointerLookInput {
  private dx = 0;
  private dy = 0;
  private touchId: number | null = null;
  private lastX = 0;
  private lastY = 0;

  constructor(private readonly element: HTMLElement) {
    element.style.touchAction = 'none';
    element.addEventListener('click', this.onClick);
    element.addEventListener('pointerdown', this.onPointerDown);
    element.addEventListener('pointermove', this.onPointerMove);
    element.addEventListener('pointerup', this.onPointerUp);
    element.addEventListener('pointercancel', this.onPointerUp);
    document.addEventListener('mousemove', this.onMove);
  }

  get isLocked(): boolean {
    return document.pointerLockElement === this.element;
  }

  /** Look movement in pixels since the last call. */
  consume(): { dx: number; dy: number } {
    const delta = { dx: this.dx, dy: this.dy };
    this.dx = this.dy = 0;
    return delta;
  }

  dispose(): void {
    this.element.removeEventListener('click', this.onClick);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    this.element.removeEventListener('pointermove', this.onPointerMove);
    this.element.removeEventListener('pointerup', this.onPointerUp);
    this.element.removeEventListener('pointercancel', this.onPointerUp);
    document.removeEventListener('mousemove', this.onMove);
  }

  private readonly onClick = (event: MouseEvent): void => {
    if ((event as PointerEvent).pointerType === 'touch') return;
    // Rejects in embedded or unfocused documents; mouse look then simply stays off.
    if (!this.isLocked) this.element.requestPointerLock()?.catch(() => undefined);
  };

  private readonly onMove = (event: MouseEvent): void => {
    if (!this.isLocked) return;
    this.dx += event.movementX;
    this.dy += event.movementY;
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch' || this.touchId !== null) return;
    this.touchId = event.pointerId;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.touchId) return;
    this.dx += (event.clientX - this.lastX) * TOUCH_SCALE;
    this.dy += (event.clientY - this.lastY) * TOUCH_SCALE;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId === this.touchId) this.touchId = null;
  };
}
