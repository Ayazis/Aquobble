import { SeededRandom } from '@core';
import { MinHeap } from './MinHeap';

describe('MinHeap', () => {
  it('pops items in priority order', () => {
    const heap = new MinHeap();
    const random = new SeededRandom(7);
    const priorities = Array.from({ length: 200 }, () => random.next());
    priorities.forEach((p, i) => heap.push(i, p));
    const popped = [];
    while (heap.length > 0) popped.push(priorities[heap.pop()]);
    expect(popped).toEqual([...priorities].sort((a, b) => a - b));
  });
});
