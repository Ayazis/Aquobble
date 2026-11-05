import type { AmbientAudio } from './AmbientAudio';

/** Speaker button (top-right) that toggles the ambient audio; stays in sync with the M key. */
export class MuteButton {
  private readonly element = document.createElement('button');

  constructor(
    container: HTMLElement,
    private readonly audio: AmbientAudio,
  ) {
    Object.assign(this.element.style, {
      position: 'fixed',
      top: '8px',
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
    this.element.setAttribute('aria-label', 'Toggle sound');
    // Keep the press away from the window's gesture listener and the canvas (pointer lock / look).
    this.element.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.element.addEventListener('click', this.onClick);
    audio.onChange = () => this.refresh();
    this.refresh();
    container.appendChild(this.element);
  }

  dispose(): void {
    this.element.remove();
  }

  private readonly onClick = (event: MouseEvent): void => {
    event.stopPropagation();
    this.audio.toggleMute();
    this.refresh();
    this.element.blur(); // so Space still jumps instead of re-pressing the button
  };

  private refresh(): void {
    this.element.textContent = this.audio.isMuted ? '🔇' : '🔊';
  }
}
