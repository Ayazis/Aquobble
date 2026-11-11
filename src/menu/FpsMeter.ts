/** Corner readout of FPS, frame time and draw counts; measures with its own animation frames, so it works paused. */
export class FpsMeter {
  private readonly element = document.createElement('div');
  private frameId: number | null = null;
  private last = 0;
  private frames = 0;
  private elapsed = 0;
  private worst = 0;

  constructor(
    container: HTMLElement,
    private readonly stats?: () => { calls: number; triangles: number },
  ) {
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
      display: 'none',
    });
    this.element.textContent = '… FPS';
    container.appendChild(this.element);
  }

  setVisible(on: boolean): void {
    this.element.style.display = on ? 'block' : 'none';
    if (on && this.frameId === null) {
      this.last = performance.now();
      this.frameId = requestAnimationFrame(this.onFrame);
    } else if (!on && this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  dispose(): void {
    this.setVisible(false);
    this.element.remove();
  }

  private readonly onFrame = (now: number): void => {
    const ms = now - this.last;
    this.last = now;
    this.frames++;
    this.elapsed += ms;
    this.worst = Math.max(this.worst, ms);
    if (this.elapsed >= 500) {
      const fps = (this.frames * 1000) / this.elapsed;
      const avg = this.elapsed / this.frames;
      const s = this.stats?.();
      const drawn = s ? ` · ${s.calls} draws · ${(s.triangles / 1000).toFixed(0)}k tris` : '';
      this.element.textContent = `${fps.toFixed(0)} FPS · ${avg.toFixed(1)} ms (worst ${this.worst.toFixed(1)})${drawn}`;
      this.frames = 0;
      this.elapsed = 0;
      this.worst = 0;
    }
    this.frameId = requestAnimationFrame(this.onFrame);
  };
}
