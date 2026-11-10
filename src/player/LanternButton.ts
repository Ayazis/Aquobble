/** Lantern button (top-right, under the sound button) for touch and mouse; the L key does the same. */
export class LanternButton {
  private readonly element = document.createElement('button');
  private pressed = false;

  constructor(container: HTMLElement) {
    Object.assign(this.element.style, {
      position: 'fixed',
      top: '60px',
      right: '8px',
      width: '44px',
      height: '44px',
      font: '22px/1 sans-serif',
      color: '#fff',
      background: 'rgba(0, 0, 0, 0.45)',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      zIndex: '10',
      touchAction: 'manipulation',
    });
    this.element.textContent = '🏮';
    this.element.title = 'Lantern (L)';
    this.element.setAttribute('aria-label', 'Toggle lantern');
    // Keep the press away from the canvas (pointer lock / look).
    this.element.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.element.addEventListener('click', this.onClick);
    this.show(false);
    container.appendChild(this.element);
  }

  /** True once per click. */
  consumePress(): boolean {
    const pressed = this.pressed;
    this.pressed = false;
    return pressed;
  }

  /** Dims the button while the lantern is off. */
  show(on: boolean): void {
    this.element.style.opacity = on ? '1' : '0.55';
    this.element.setAttribute('aria-pressed', String(on));
  }

  dispose(): void {
    this.element.remove();
  }

  private readonly onClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.pressed = true;
    this.element.blur(); // so Space still jumps instead of re-pressing the button
  };
}
