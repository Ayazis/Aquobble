import * as THREE from 'three';
import { RippleBox, type RippleDrop } from './RippleBox';
import { RIPPLE_SIM_FRAGMENT, RIPPLE_SIM_VERTEX } from './rippleGlsl';
import type { RippleStamper } from './RippleStamper';
import type { RippleUniforms } from './RippleUniforms';

const MAX_DROPS = 16;
/** Wave stiffness at 256 texels over 40 m (about 2 m/s); scaled with resolution so speed stays in m/s. */
const STIFFNESS_256 = 0.06;

/**
 * GPU ripple height field (2.5): a box of `size` m round a target, ping-ponged between two float targets
 * each step. Stamps queue up and are drawn into the next step (16 per step, the rest wait).
 */
export class RippleSimulation implements RippleStamper {
  private readonly box: RippleBox;
  private readonly targets: THREE.WebGLRenderTarget[];
  private readonly material: THREE.ShaderMaterial;
  private readonly quad: THREE.Mesh;
  private readonly camera = new THREE.Camera();
  private readonly queue: RippleDrop[] = [];
  private current = 0;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly uniforms: RippleUniforms,
    resolution = 256,
    size = 40,
  ) {
    this.box = new RippleBox(size, resolution);
    const options = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter };
    this.targets = [0, 1].map(() => new THREE.WebGLRenderTarget(resolution, resolution, options));
    const scale = resolution / 256;
    this.material = new THREE.ShaderMaterial({
      vertexShader: RIPPLE_SIM_VERTEX,
      fragmentShader: RIPPLE_SIM_FRAGMENT,
      uniforms: {
        uPrev: { value: null },
        uTexel: { value: new THREE.Vector2(1 / resolution, 1 / resolution) },
        uShift: { value: new THREE.Vector2() },
        uStiffness: { value: Math.min(0.2, STIFFNESS_256 * scale * scale) },
        uDrops: { value: Array.from({ length: MAX_DROPS }, () => new THREE.Vector4()) },
        uDropFoam: { value: new Array<number>(MAX_DROPS).fill(0) },
        uDropCount: { value: 0 },
      },
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    uniforms.uRippleTexel.value = 1 / resolution;
  }

  stamp(x: number, z: number, radius: number, strength: number, foam = 0): void {
    const drop = this.box.toDrop(x, z, radius, strength, foam);
    if (drop && this.queue.length < MAX_DROPS * 8) this.queue.push(drop);
  }

  /** Recentres on (x, z) and advances the field one step. */
  step(x: number, z: number): void {
    const before = { x: this.box.minX, z: this.box.minZ };
    const { dx, dz } = this.box.follow(x, z);
    // Stamps queued before the move are re-expressed in the new box.
    const du = (this.box.minX - before.x) / this.box.size;
    const dv = (this.box.minZ - before.z) / this.box.size;
    const u = this.material.uniforms;
    u.uShift.value.set(dx, dz);
    const drops = this.queue.splice(0, MAX_DROPS);
    drops.forEach((d, i) => {
      u.uDrops.value[i].set(d.u - du, d.v - dv, d.radius, d.strength);
      u.uDropFoam.value[i] = d.foam;
    });
    for (const d of this.queue) {
      d.u -= du;
      d.v -= dv;
    }
    u.uDropCount.value = drops.length;
    const read = this.targets[this.current];
    const write = this.targets[1 - this.current];
    u.uPrev.value = read.texture;
    const previous = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(write);
    this.renderer.render(this.quad, this.camera);
    this.renderer.setRenderTarget(previous);
    this.current = 1 - this.current;
    this.uniforms.uRippleMap.value = write.texture;
    this.uniforms.uRippleBox.value.set(this.box.minX, this.box.minZ, this.box.size);
  }

  dispose(): void {
    for (const t of this.targets) t.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}
