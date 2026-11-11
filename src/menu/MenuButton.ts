import { HUD_BUTTON } from './menuControls';

/** Menu button (top-right, under the lantern button): phones have no Escape key. */
export class MenuButton {
  private readonly element = document.createElement('button');

  constructor(container: HTMLElement, onClick: () => void) {
    Object.assign(this.element.style, HUD_BUTTON, { top: '112px' });
    this.element.textContent = '☰';
    this.element.title = 'Menu (Esc)';
    this.element.setAttribute('aria-label', 'Open menu');
    // Keep the press away from the window's gesture listener and the canvas (pointer lock / look).
    this.element.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.element.addEventListener('click', (event) => {
      event.stopPropagation();
      this.element.blur();
      onClick();
    });
    container.appendChild(this.element);
  }

  dispose(): void {
    this.element.remove();
  }
}
