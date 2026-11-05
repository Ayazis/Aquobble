/** Locks the pointer on canvas click and accumulates mouse movement while locked. */
export class PointerLookInput {
  private dx = 0;
  private dy = 0;

  constructor(private readonly element: HTMLElement) {
    element.addEventListener('click', this.onClick);
    document.addEventListener('mousemove', this.onMove);
  }

  get isLocked(): boolean {
    return document.pointerLockElement === this.element;
  }

  /** Mouse movement in pixels since the last call. */
  consume(): { dx: number; dy: number } {
    const delta = { dx: this.dx, dy: this.dy };
    this.dx = this.dy = 0;
    return delta;
  }

  dispose(): void {
    this.element.removeEventListener('click', this.onClick);
    document.removeEventListener('mousemove', this.onMove);
  }

  private readonly onClick = (): void => {
    if (!this.isLocked) void this.element.requestPointerLock();
  };

  private readonly onMove = (event: MouseEvent): void => {
    if (!this.isLocked) return;
    this.dx += event.movementX;
    this.dy += event.movementY;
  };
}
