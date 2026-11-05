import type { GameWorld, System } from '@core';
import { locomotionClip, turnTowards } from '@player';
import type {} from './Townsfolk';

const FADE_SECONDS = 0.2;
const TURN_SPEED = 6; // radians per second

/** Frame system: plays idle/walk from each townsperson's speed and turns the model to face where it walks. */
export class TownsfolkAnimationSystem implements System {
  private readonly folks;

  constructor(world: GameWorld) {
    this.folks = world.with('townsfolk', 'characterAnimation');
  }

  update(dt: number): void {
    for (const { townsfolk: folk, characterAnimation: anim } of this.folks) {
      const speed = Math.hypot(folk.moveX, folk.moveZ);
      const clip = locomotionClip(speed, folk.walkSpeed, folk.walkSpeed * 2);
      if (clip !== anim.current) {
        anim.actions[clip].reset().play();
        anim.actions[anim.current].crossFadeTo(anim.actions[clip], FADE_SECONDS, false);
        anim.current = clip;
      }
      if (speed > 0.1) {
        const target = Math.atan2(folk.moveX, folk.moveZ);
        anim.facing.rotation.y = turnTowards(anim.facing.rotation.y, target, TURN_SPEED * dt);
      }
      anim.mixer.update(dt);
    }
  }
}
