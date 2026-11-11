import * as THREE from 'three';
import { MAX_BEND_STAMPS, packStamps, snapToTexel, type BendStamp } from './BendStamp';
import { createBendUniforms, type BendUniforms } from './BendUniforms';
import { BEND_UPDATE_VERTEX, bendUpdateFragment } from './bendUpdateGlsl';

/**
 * The trampling trail: a small float map over a box that follows the player, ping-ponged between two
 * render targets with one full-screen quad per frame. Plant shaders read it through `uniforms`.
 */
export class BendMap {
  readonly uniforms: BendUniforms = createBendUniforms();
  private readonly targets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private readonly material: THREE.ShaderMaterial;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly discs = new Float32Array(MAX_BEND_STAMPS * 4);
  private readonly motion = new Float32Array(MAX_BEND_STAMPS * 4);
  private center: THREE.Vector2 | null = null;
  private current = 0;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly resolution = 128,
    private readonly boxSize = 32,
  ) {
    const options = { type: THREE.HalfFloatType, depthBuffer: false, magFilter: THREE.LinearFilter };
    this.targets = [
      new THREE.WebGLRenderTarget(resolution, resolution, options),
      new THREE.WebGLRenderTarget(resolution, resolution, options),
    ];
    this.material = new THREE.ShaderMaterial({
      vertexShader: BEND_UPDATE_VERTEX,
      fragmentShader: bendUpdateFragment(),
      uniforms: {
        uPrev: { value: null },
        uShift: { value: new THREE.Vector2() },
        uBox: { value: new THREE.Vector3(0, 0, boxSize) },
        uDt: { value: 0 },
        uDiscs: { value: this.discs },
        uMotion: { value: this.motion },
      },
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);
    this.uniforms.uBendBox.value.set(0, 0, boxSize);
  }

  /** Advances the map by `dt`, re-centred on (x, z), with this frame's stamps pressed in. */
  step(dt: number, x: number, z: number, stamps: readonly BendStamp[]): void {
    const cx = snapToTexel(x, this.boxSize, this.resolution);
    const cz = snapToTexel(z, this.boxSize, this.resolution);
    const prev = this.center ?? new THREE.Vector2(cx, cz);
    const u = this.material.uniforms;
    // A jump far away (respawn, first frame) starts from a clean map rather than scrolling garbage in.
    u.uShift.value.set((cx - prev.x) / this.boxSize, (cz - prev.y) / this.boxSize);
    if (Math.abs(u.uShift.value.x) > 1 || Math.abs(u.uShift.value.y) > 1) u.uShift.value.set(2, 2);
    this.center = new THREE.Vector2(cx, cz);
    u.uBox.value.set(cx, cz, this.boxSize);
    u.uDt.value = Math.min(dt, 1 / 20);
    packStamps(stamps, this.discs, this.motion);

    const read = this.targets[this.current];
    const write = this.targets[1 - this.current];
    u.uPrev.value = read.texture;
    const before = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(write);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(before);
    this.current = 1 - this.current;
    this.uniforms.uBendMap.value = write.texture;
    this.uniforms.uBendBox.value.set(cx, cz, this.boxSize);
  }

  dispose(): void {
    for (const t of this.targets) t.dispose();
    this.material.dispose();
  }
}
