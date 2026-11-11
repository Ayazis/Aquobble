import type * as THREE from 'three';
import { swimClips } from './swimClips';
import type { SwimRig } from './SwimRig';

/** Kick at half the walk's pace, the run's arm swing slowed to a crawl, treading slower than idle. */
const KICK_SPEED = 0.5;
const STROKE_SPEED = 0.45;
const TREAD_SPEED = 0.6;

/** Adds the swim actions to the player's mixer, all playing at weight 0 until `swimPose` blends them in. */
export function createSwimRig(
  mixer: THREE.AnimationMixer,
  body: THREE.Object3D,
  walk: THREE.AnimationClip,
  run: THREE.AnimationClip,
  idle: THREE.AnimationClip,
): SwimRig {
  const clips = swimClips(walk, run, idle);
  const start = (clip: THREE.AnimationClip, speed: number) => {
    const action = mixer.clipAction(clip);
    action.timeScale = speed;
    action.weight = 0;
    return action.play();
  };
  return {
    kick: start(clips.kick, KICK_SPEED),
    stroke: start(clips.stroke, STROKE_SPEED),
    tread: start(clips.tread, TREAD_SPEED),
    body,
    baseY: body.position.y,
    baseZ: body.position.z,
    deep: 0,
    moving: 0,
    sink: 0,
    time: 0,
  };
}
