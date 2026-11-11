/** Seconds a ripple ring lives, and a fish's jump lasts. */
export const RIPPLE_LIFE = 2.2;
export const JUMP_TIME = 0.7;

/** Pure: a ripple ring `age` seconds old: its radius (m) and brightness in [0, 1]; 0 once it is gone. */
export function fishRipple(age: number): { radius: number; fade: number } {
  if (age < 0 || age >= RIPPLE_LIFE) return { radius: 0, fade: 0 };
  const k = age / RIPPLE_LIFE;
  return { radius: 0.15 + 1.4 * Math.sqrt(k), fade: (1 - k) ** 2 };
}

/** Pure: a jumping fish `age` seconds in: how far along (0..1) and how high (m) above the water; null when not in the air. */
export function fishJump(age: number, height = 0.45): { along: number; lift: number } | null {
  if (age < 0 || age > JUMP_TIME) return null;
  const k = age / JUMP_TIME;
  return { along: k, lift: 4 * height * k * (1 - k) };
}
