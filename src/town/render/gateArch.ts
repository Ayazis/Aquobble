import type { TownGate, TownWall } from '../layout/TownWall';

/** Rise of the gate arch above its springing line. Shallow, so the passage stays at least head-high. */
export const ARCH_RISE = 1;
/** Stone kept between the arch crown and the lintel. */
const CROWN = 0.35;
/** Arch depth beyond the wall, matching the gatehouse lintel. */
const DEPTH_OUT = 0.4;

/** An elliptical arch under a gate's lintel, in the gate's own frame: x along the wall, y up, z across. */
export interface GateArch {
  /** Half the gate width: the arch's half span. */
  halfSpan: number;
  /** Height where the arch starts to curve. */
  springing: number;
  /** Underside of the lintel, where the arch's flat top sits. */
  top: number;
  depth: number;
}

export function gateArch(wall: TownWall, gate: TownGate): GateArch {
  const top = wall.height;
  return { halfSpan: gate.width / 2, springing: top - CROWN - ARCH_RISE, top, depth: wall.thickness + DEPTH_OUT };
}
