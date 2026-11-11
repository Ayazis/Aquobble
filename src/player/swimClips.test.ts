import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { swimClips } from './swimClips';

const track = (name: string) => new THREE.QuaternionKeyframeTrack(name, [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]);
const clip = (name: string) =>
  new THREE.AnimationClip(name, 1, [
    track('UpperLeg.L.quaternion'),
    track('UpperArm.R.quaternion'),
    track('Head.quaternion'),
  ]);

describe('swimClips', () => {
  it('keeps the legs of walk for the kick and the arms of run for the stroke', () => {
    const clips = swimClips(clip('Walk'), clip('Run'), clip('Idle'));
    expect(clips.kick.tracks.map((t) => t.name)).toEqual(['UpperLeg.L.quaternion']);
    expect(clips.stroke.tracks.map((t) => t.name)).toEqual(['UpperArm.R.quaternion']);
    expect(clips.tread.name).toBe('SwimTread');
    expect(clips.tread.tracks).toHaveLength(3);
  });
});
