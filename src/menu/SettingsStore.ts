import { DEFAULT_SETTINGS, type MenuSettings } from './MenuSettings';

const KEY = 'aquobble.settings';

/** Loads and saves `MenuSettings` in localStorage; storage failures (private mode, blocked) fall back to defaults. */
export class SettingsStore {
  readonly settings: MenuSettings;

  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = safeLocalStorage()) {
    this.settings = { ...DEFAULT_SETTINGS, ...this.read() };
  }

  update(patch: Partial<MenuSettings>): void {
    Object.assign(this.settings, patch);
    try {
      this.storage?.setItem(KEY, JSON.stringify(this.settings));
    } catch {
      // Not saved; the setting still applies for this session.
    }
  }

  private read(): Partial<MenuSettings> {
    try {
      const raw = this.storage?.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      return typeof parsed === 'object' && parsed !== null ? (parsed as Partial<MenuSettings>) : {};
    } catch {
      return {};
    }
  }
}

function safeLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
