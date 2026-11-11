import * as THREE from 'three';
import { applyCharacterRim } from '@rendering';
import type { CharacterAnimation, LocomotionClip } from './CharacterAnimation';
import { createSwimRig } from './createSwimRig';

/** The rigged character file: its scene and clips, as loaded from glTF. */
export interface AnimatedModel {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
}

const CLIP_NAMES: Record<LocomotionClip, string> = { idle: 'Idle', walk: 'Walk', run: 'Run' };

/**
 * Builds the player visual from the rigged character: scaled to `height`, feet at the bottom of the
 * capsule (the render object's origin is the capsule centre), with idle/walk/run actions ready to play.
 */
export class PlayerModelFactory {
  constructor(
    private readonly model: AnimatedModel,
    private readonly height = 1.6,
  ) {}

  create(halfHeight: number, radius: number): { object: THREE.Object3D; animation: CharacterAnimation } {
    const scene = this.model.scene;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = size.y > 0 ? this.height / size.y : 1;
    scene.scale.setScalar(scale);
    scene.position.y = -box.min.y * scale;
    scene.traverse((o) => {
      o.castShadow = true;
      o.frustumCulled = false;
    });
    applyCharacterRim(scene);

    const facing = new THREE.Group();
    facing.position.y = -(halfHeight + radius);
    facing.add(scene);
    const object = new THREE.Group();
    object.add(facing);

    const mixer = new THREE.AnimationMixer(scene);
    const clip = (name: LocomotionClip) => {
      const found = THREE.AnimationClip.findByName(this.model.animations, CLIP_NAMES[name]);
      if (!found) throw new Error(`Character model has no "${CLIP_NAMES[name]}" animation`);
      return found;
    };
    const actions = {
      idle: mixer.clipAction(clip('idle')),
      walk: mixer.clipAction(clip('walk')),
      run: mixer.clipAction(clip('run')),
    };
    actions.idle.play();
    const swim = createSwimRig(mixer, scene, clip('walk'), clip('run'), clip('idle'));
    return { object, animation: { mixer, actions, current: 'idle', facing, swim } };
  }
}
