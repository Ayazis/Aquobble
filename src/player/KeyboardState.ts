/** Which keys (by `KeyboardEvent.code`) are held, plus presses since the last check. */
export class KeyboardState {
  private readonly held = new Set<string>();
  private readonly pressed = new Set<string>();

  constructor(private readonly target: Window = window) {
    target.addEventListener('keydown', this.onDown);
    target.addEventListener('keyup', this.onUp);
    target.addEventListener('blur', this.onBlur);
  }

  isHeld(code: string): boolean {
    return this.held.has(code);
  }

  /** True once per physical press. */
  consumePress(code: string): boolean {
    return this.pressed.delete(code);
  }

  dispose(): void {
    this.target.removeEventListener('keydown', this.onDown);
    this.target.removeEventListener('keyup', this.onUp);
    this.target.removeEventListener('blur', this.onBlur);
  }

  private readonly onDown = (event: KeyboardEvent): void => {
    if (!event.repeat) this.pressed.add(event.code);
    this.held.add(event.code);
  };

  private readonly onUp = (event: KeyboardEvent): void => {
    this.held.delete(event.code);
  };

  private readonly onBlur = (): void => {
    this.held.clear();
    this.pressed.clear();
  };
}
