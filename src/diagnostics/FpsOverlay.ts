/** Small fixed-position text box for the FPS readout. */
export class FpsOverlay {
  private readonly element = document.createElement('div');

  constructor(container: HTMLElement) {
    Object.assign(this.element.style, {
      position: 'fixed',
      top: '8px',
      left: '8px',
      padding: '4px 8px',
      font: '12px/1.4 ui-monospace, monospace',
      color: '#fff',
      background: 'rgba(0, 0, 0, 0.45)',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: '10',
    });
    container.appendChild(this.element);
  }

  show(fps: number, worstFrameMs: number): void {
    this.element.textContent = `${fps.toFixed(0)} FPS · worst ${worstFrameMs.toFixed(1)} ms`;
  }

  dispose(): void {
    this.element.remove();
  }
}
