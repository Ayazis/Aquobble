import { describe, expect, it } from 'vitest';
import { vertexAo } from './vertexAo';

describe('vertexAo', () => {
  // A floor vertex at the origin facing up, under a roof quad 0.5 above it, plus a lone far vertex.
  const positions = [0, 0, 0, -1, 0.5, -1, 1, 0.5, -1, 1, 0.5, 1, -1, 0.5, 1, 10, 0, 10];
  const normals = [0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0];
  const indices = [1, 2, 3, 1, 3, 4];

  it('darkens a vertex under a roof and leaves an open one at 1', () => {
    const ao = vertexAo(positions, normals, indices, 6, 2);
    expect(ao[0]).toBeLessThan(0.6);
    expect(ao[5]).toBe(1);
  });

  it('ignores geometry beyond the reach', () => {
    expect(vertexAo(positions, normals, indices, 6, 0.2)[0]).toBe(1);
  });
});
