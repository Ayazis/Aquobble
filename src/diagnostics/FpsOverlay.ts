/** Small fixed-position text box for the FPS readout and the frame's draw counts (debug mode only). */
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

  show(fps: number, worstFrameMs: number, render?: { calls: number; triangles: number }): void {
    const frame = `${fps.toFixed(0)} FPS · worst ${worstFrameMs.toFixed(1)} ms`;
    const drawn = render ? ` · ${render.calls} draws · ${(render.triangles / 1000).toFixed(0)}k tris` : '';
    this.element.textContent = frame + drawn;
  }

  dispose(): void {
    this.element.remove();
  }
}
