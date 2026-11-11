import type { CharacterAnimation } from './CharacterAnimation';
import type { SwimRig } from './SwimRig';

const PITCH = (70 * Math.PI) / 180;
const BLEND_RATE = 3; // per second: about a third of a second from wading to swimming
const BOB = 0.04;

/** The water the character is in, as far as the swim pose needs it. */
export interface SwimWater {
  /** Water above the feet (m); not positive on land. */
  immersion: number;
  swimming: boolean;
  speed: number;
  height: number;
}

/** Target blend in [0, 1] from wading to afloat: deep wading eases in before the movement says swim. */
export function deepness(w: SwimWater): number {
  if (w.swimming) return 1;
  const t = (w.immersion - w.height * 0.45) / (w.height * 0.2);
  return Math.min(1, Math.max(0, t));
}

/**
 * Blends wade, swim and tread (2.14) with no pop: land clips fade out as the water deepens, the kick and
 * stroke take over while moving, treading while still; the body pitches forward about a hip pivot, sinks so
 * the back (swimming) or the shoulders (treading) sit at the surface, and bobs.
 */
export function swimPose(anim: CharacterAnimation, rig: SwimRig, w: SwimWater, dt: number): void {
  const k = Math.min(1, dt * BLEND_RATE);
  rig.deep += (deepness(w) - rig.deep) * k;
  rig.moving += ((w.speed > 0.3 ? 1 : 0) - rig.moving) * k;
  rig.time += dt;
  const { deep, moving } = rig;
  for (const action of Object.values(anim.actions)) action.weight = 1 - deep;
  rig.kick.weight = deep * moving;
  rig.stroke.weight = deep * moving;
  rig.tread.weight = deep * (1 - moving);

  const hip = w.height * 0.5;
  const angle = PITCH * deep * moving;
  const backAtSurface = w.immersion - 0.15 - hip;
  const shouldersAtSurface = w.immersion - w.height * 0.8;
  const target = Math.min(0, deep * (moving * backAtSurface + (1 - moving) * shouldersAtSurface));
  rig.sink += (target - rig.sink) * k;
  const bob = Math.sin(rig.time * 2.2) * BOB * deep;
  rig.body.rotation.x = angle;
  rig.body.position.y = rig.baseY + hip * (1 - Math.cos(angle)) + rig.sink + bob;
  rig.body.position.z = rig.baseZ - hip * Math.sin(angle);
}
