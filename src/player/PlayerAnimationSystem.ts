import type { GameWorld, System } from '@core';
import type {} from './CharacterAnimation';
import { locomotionClip } from './locomotionClip';
import type {} from './Player';
import { turnTowards } from './turnTowards';

const FADE_SECONDS = 0.2;
const TURN_SPEED = 10; // radians per second

/** Frame system: plays idle/walk/run from the player's speed and turns the model to face where it moves. */
export class PlayerAnimationSystem implements System {
  private readonly players;

  constructor(world: GameWorld) {
    this.players = world.with('player', 'characterAnimation');
  }

  update(dt: number): void {
    for (const { player, characterAnimation: anim } of this.players) {
      const speed = Math.hypot(player.moveX, player.moveZ);
      const clip = locomotionClip(speed, player.walkSpeed, player.runSpeed);
      if (clip !== anim.current) {
        anim.actions[clip].reset().play();
        anim.actions[anim.current].crossFadeTo(anim.actions[clip], FADE_SECONDS, false);
        anim.current = clip;
      }
      if (speed > 0.1) {
        const target = Math.atan2(player.moveX, player.moveZ);
        anim.facing.rotation.y = turnTowards(anim.facing.rotation.y, target, TURN_SPEED * dt);
      }
      anim.mixer.update(dt);
    }
  }
}
