const RADIUS = 55;
const RUN_THRESHOLD = 0.9;

/**
 * On-screen controls for touch devices: a virtual joystick (bottom-left) and a jump button
 * (bottom-right). Only shown when the device has a coarse pointer. Read by PlayerInputSystem.
 */
export class TouchControls {
  forward = 0;
  right = 0;
  run = false;
  private jumpPressed = false;
  private stickId: number | null = null;
  private readonly root = document.createElement('div');
  private readonly base = document.createElement('div');
  private readonly knob = document.createElement('div');
  private readonly jump = document.createElement('button');

  constructor(container: HTMLElement) {
    Object.assign(this.root.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '10' });
    circle(this.base, RADIUS * 2, 'rgba(255,255,255,0.15)');
    Object.assign(this.base.style, { left: '28px', bottom: '28px', pointerEvents: 'auto', touchAction: 'none' });
    circle(this.knob, 56, 'rgba(255,255,255,0.45)');
    Object.assign(this.knob.style, { left: `${RADIUS - 28}px`, top: `${RADIUS - 28}px` });
    circle(this.jump, 76, 'rgba(255,255,255,0.25)');
    Object.assign(this.jump.style, { right: '32px', bottom: '48px', pointerEvents: 'auto', touchAction: 'none' });
    Object.assign(this.jump.style, { color: '#fff', font: 'bold 14px sans-serif' });
    this.jump.textContent = 'JUMP';
    this.base.appendChild(this.knob);
    this.root.append(this.base, this.jump);
    container.appendChild(this.root);

    this.base.addEventListener('pointerdown', this.onStickDown);
    this.base.addEventListener('pointermove', this.onStickMove);
    this.base.addEventListener('pointerup', this.onStickUp);
    this.base.addEventListener('pointercancel', this.onStickUp);
    this.jump.addEventListener('pointerdown', this.onJump);
  }

  /** True once per jump-button press. */
  consumeJump(): boolean {
    const pressed = this.jumpPressed;
    this.jumpPressed = false;
    return pressed;
  }

  dispose(): void {
    this.root.remove();
  }

  private readonly onStickDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.stickId = event.pointerId;
    this.base.setPointerCapture(event.pointerId);
    this.onStickMove(event);
  };

  private readonly onStickMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.stickId) return;
    const rect = this.base.getBoundingClientRect();
    let x = (event.clientX - rect.left - RADIUS) / RADIUS;
    let y = (event.clientY - rect.top - RADIUS) / RADIUS;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    this.right = x;
    this.forward = -y;
    this.run = length >= RUN_THRESHOLD;
    this.knob.style.transform = `translate(${x * RADIUS}px, ${y * RADIUS}px)`;
  };

  private readonly onStickUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.stickId) return;
    this.stickId = null;
    this.forward = this.right = 0;
    this.run = false;
    this.knob.style.transform = '';
  };

  private readonly onJump = (event: PointerEvent): void => {
    event.preventDefault();
    this.jumpPressed = true;
  };
}

function circle(el: HTMLElement, size: number, background: string): void {
  Object.assign(el.style, {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.5)',
    background,
    userSelect: 'none',
  });
}
