/** Shared look of the HUD buttons (matches the sound and lantern buttons). */
export const HUD_BUTTON: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
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
};

const PANEL_BUTTON: Partial<CSSStyleDeclaration> = {
  minHeight: '36px',
  padding: '0 12px',
  font: '14px/1 system-ui, sans-serif',
  color: '#fff',
  background: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  cursor: 'pointer',
  touchAction: 'manipulation',
};

/** Builds a styled element. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  style: Partial<CSSStyleDeclaration> = {},
  text = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  if (text) node.textContent = text;
  return node;
}

/** A titled section with a wrapping row of controls. */
export function section(title: string, ...children: HTMLElement[]): HTMLElement {
  const box = el('div', { display: 'flex', flexDirection: 'column', gap: '6px' });
  box.append(el('div', { fontSize: '12px', opacity: '0.7', textTransform: 'uppercase' }, title));
  const row = el('div', { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' });
  row.append(...children);
  box.append(row);
  return box;
}

export function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', PANEL_BUTTON, label);
  b.addEventListener('click', onClick);
  return b;
}

/** Highlights the active button of a group or an on toggle. */
export function markActive(b: HTMLElement, active: boolean): void {
  b.style.background = active ? 'rgba(255, 210, 120, 0.45)' : 'rgba(255, 255, 255, 0.12)';
  b.setAttribute('aria-pressed', String(active));
}

/** A row of buttons where exactly one is active. */
export function choiceGroup<T extends string>(
  options: readonly (readonly [T, string])[],
  get: () => T,
  set: (value: T) => void,
): { buttons: HTMLButtonElement[]; refresh(): void } {
  const buttons = options.map(([value, label]) =>
    button(label, () => {
      set(value);
      refresh();
    }),
  );
  const refresh = () => buttons.forEach((b, i) => markActive(b, options[i]?.[0] === get()));
  refresh();
  return { buttons, refresh };
}
