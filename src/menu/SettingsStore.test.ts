import { describe, expect, it } from 'vitest';
import { SettingsStore } from './SettingsStore';

const memory = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

describe('SettingsStore', () => {
  it('starts from defaults and round-trips updates', () => {
    const storage = memory();
    const store = new SettingsStore(storage);
    expect(store.settings.weather).toBe('auto');
    store.update({ weather: 'rain', fps: true });
    expect(new SettingsStore(storage).settings).toMatchObject({ weather: 'rain', fps: true });
  });

  it('survives broken storage', () => {
    const fail = () => {
      throw new Error('blocked');
    };
    const store = new SettingsStore({ getItem: fail, setItem: fail });
    expect(() => store.update({ fps: true })).not.toThrow();
    expect(store.settings.fps).toBe(true);
  });
});
