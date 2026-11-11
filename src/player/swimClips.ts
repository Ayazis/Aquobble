import * as THREE from 'three';

const LEGS = /leg|foot|toe|thigh|shin|calf|knee/i;
const ARMS = /arm|hand|shoulder|clavicle|elbow|wrist|finger|thumb|index|middle|ring|pinky/i;

/** Procedural swim clips (2.14) cut from the land clips, since the model has no swim animation. */
export interface SwimClips {
  /** Walk's leg tracks only: a flutter kick when played slowly. */
  kick: THREE.AnimationClip;
  /** Run's arm tracks only: a crawl stroke when slowed down. */
  stroke: THREE.AnimationClip;
  /** Idle under its own name, to play as treading water alongside the land idle. */
  tread: THREE.AnimationClip;
}

function bone(track: THREE.KeyframeTrack): string {
  return track.name.slice(0, track.name.lastIndexOf('.'));
}

function only(clip: THREE.AnimationClip, name: string, pattern: RegExp): THREE.AnimationClip {
  const tracks = clip.tracks.filter((t) => pattern.test(bone(t)) && !t.name.endsWith('.position'));
  return new THREE.AnimationClip(
    name,
    clip.duration,
    tracks.map((t) => t.clone()),
  );
}

export function swimClips(walk: THREE.AnimationClip, run: THREE.AnimationClip, idle: THREE.AnimationClip): SwimClips {
  const tread = idle.clone();
  tread.name = 'SwimTread';
  return { kick: only(walk, 'SwimKick', LEGS), stroke: only(run, 'SwimStroke', ARMS), tread };
}
