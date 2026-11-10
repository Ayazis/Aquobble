import { DebugTools, type DebugApi } from './DebugTools';
import type { DebugCamera } from './DebugCamera';

function setup(pressed: string[] = []) {
  const clock = { timeOfDay: 0.5, paused: false, setTimeOfDay: vi.fn() };
  const camera = { toggle: vi.fn(), apply: vi.fn(), hold: vi.fn(), release: vi.fn() };
  const keys = { isHeld: () => false, consumePress: (code: string) => pressed.includes(code) };
  const target: { __aquobble?: DebugApi } = {};
  const render = { stats: () => ({ calls: 7, triangles: 99 }) };
  const tools = new DebugTools(clock, camera as unknown as DebugCamera, keys, render, () => 3, target);
  return { clock, camera, tools, api: target.__aquobble as DebugApi };
}

describe('DebugTools', () => {
  it('steps the clock and toggles pause and camera from the keyboard', () => {
    const { clock, camera, tools } = setup(['BracketRight', 'Backslash', 'KeyF']);
    tools.update(0.016);
    expect(clock.setTimeOfDay).toHaveBeenCalledWith(0.5 + 1 / 48);
    expect(clock.paused).toBe(true);
    expect(camera.toggle).toHaveBeenCalled();
  });

  it('publishes an API that counts frames and forwards to the clock, camera and renderer', () => {
    const { clock, camera, tools, api } = setup();
    tools.update(0.016);
    tools.update(0.016);
    expect(api.frame).toBe(2);
    api.setTimeOfDay(0.9);
    api.pauseTime(true);
    api.setCamera({ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0 });
    expect(clock.setTimeOfDay).toHaveBeenCalledWith(0.9);
    expect(clock.paused).toBe(true);
    expect(camera.hold).toHaveBeenCalled();
    expect(api.stats()).toEqual({ calls: 7, triangles: 99 });
    expect(api.groundHeight(0, 0)).toBe(3);
  });
});
