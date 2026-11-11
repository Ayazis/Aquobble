/**
 * The blade spring the bend map runs on the GPU, with a CPU twin for tests. Natural frequency and damping
 * are picked so a released blade rises back over about 3 s with no visible overshoot.
 */
export const BEND_SPRING = {
  /** Natural angular frequency (rad/s). */
  omega: 1.6,
  /**
   * Damping ratio: close to 1, so a blade rises back without swinging past upright. A lower ratio made the
   * whole trail oscillate, which read as a ring of grass pulsing out from the player.
   */
  zeta: 0.9,
  /** How fast a stamped blade is pushed to its stamp target (per second). */
  press: 14,
} as const;

/** Spring stiffness and damping terms for `a = -k d - c v`. */
export function springTerms(): { k: number; c: number } {
  const { omega, zeta } = BEND_SPRING;
  return { k: omega * omega, c: 2 * zeta * omega };
}

/** One semi-implicit Euler step of the free spring (no stamp), same maths as the GLSL. */
export function springStep(d: number, v: number, dt: number): [number, number] {
  const { k, c } = springTerms();
  const nv = v + (-k * d - c * v) * dt;
  return [d + nv * dt, nv];
}
