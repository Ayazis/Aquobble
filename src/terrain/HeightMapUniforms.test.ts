import * as THREE from 'three';
import { HeightField } from './HeightField';
import { createHeightMapUniforms } from './HeightMapUniforms';

describe('createHeightMapUniforms', () => {
  it('stores every height and maps grid samples onto texel centres', () => {
    const field = new HeightField(3, 20, Float32Array.from([0, 1, 2, 3, 4, 5, 6, 7, -8.5]));
    const { uHeightMap, uHeightMapFrame } = createHeightMapUniforms(field);
    const data = uHeightMap.value.image.data as Uint16Array;
    expect(THREE.DataUtils.fromHalfFloat(data[8])).toBeCloseTo(-8.5);
    expect(THREE.DataUtils.fromHalfFloat(data[4])).toBeCloseTo(4);
    const u = (x: number) => x * uHeightMapFrame.value.x + uHeightMapFrame.value.y;
    expect(u(-10)).toBeCloseTo(0.5 / 3);
    expect(u(0)).toBeCloseTo(0.5);
    expect(u(10)).toBeCloseTo(2.5 / 3);
    expect(uHeightMapFrame.value.z).toBe(10);
  });
});
