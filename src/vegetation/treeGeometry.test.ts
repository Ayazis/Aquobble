import * as THREE from 'three';
import { applyCrownSway } from './applyCrownSway';
import { CROWN_BASE, treeCrownGeometry } from './treeCrownGeometry';
import { TRUNK, treeTrunkGeometry } from './treeTrunkGeometry';

/** Largest distance from the y axis among vertices whose height passes `keep`. */
function reach(geometry: THREE.BufferGeometry, keep: (y: number) => boolean): number {
  const p = geometry.attributes.position;
  let max = 0;
  for (let i = 0; i < p.count; i++) if (keep(p.getY(i))) max = Math.max(max, Math.hypot(p.getX(i), p.getZ(i)));
  return max;
}

describe('treeTrunkGeometry', () => {
  it('flares into roots at the ground and tapers to the top', () => {
    const trunk = treeTrunkGeometry();
    const foot = reach(trunk, (y) => y < 0.2);
    const waist = reach(trunk, (y) => y > 1 && y < 2);
    const top = reach(trunk, (y) => y > TRUNK.height - 0.1);
    expect(foot).toBeGreaterThan(waist * 1.5);
    expect(waist).toBeLessThanOrEqual(TRUNK.radius * 1.1);
    expect(top).toBeLessThan(waist);
  });
});

describe('treeCrownGeometry', () => {
  it('paints undersides darker than tops and starts above the sway base', () => {
    const crown = treeCrownGeometry();
    const { position, normal, color } = crown.attributes;
    const brightness = { down: [] as number[], up: [] as number[] };
    let lowest = Infinity;
    for (let i = 0; i < position.count; i++) {
      lowest = Math.min(lowest, position.getY(i));
      if (normal.getY(i) < -0.7) brightness.down.push(color.getY(i));
      if (normal.getY(i) > 0.7) brightness.up.push(color.getY(i));
    }
    const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
    expect(mean(brightness.down)).toBeLessThan(mean(brightness.up) * 0.6);
    expect(lowest).toBeGreaterThanOrEqual(CROWN_BASE);
  });
});

describe('applyCrownSway', () => {
  it('adds the sway after an earlier patch and shares the clock', () => {
    const material = new THREE.MeshStandardMaterial();
    material.onBeforeCompile = (shader) => {
      shader.uniforms.earlier = { value: 1 };
    };
    const clock = { time: { value: 0 } };
    applyCrownSway(material, clock, CROWN_BASE);
    const shader = { uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader, fragmentShader: '' };
    type Shader = Parameters<THREE.Material['onBeforeCompile']>[0];
    material.onBeforeCompile(shader as unknown as Shader, undefined as unknown as THREE.WebGLRenderer);
    const uniforms = shader.uniforms as Record<string, THREE.IUniform>;
    expect(uniforms.earlier.value).toBe(1);
    expect(uniforms.uWindTime).toBe(clock.time);
    expect(shader.vertexShader).toContain('float crownLift = max(position.y - 3.00, 0.0);');
  });
});
