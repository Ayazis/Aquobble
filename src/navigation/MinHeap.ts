/** Binary min-heap of integer items ordered by a float priority. Reused between searches via `clear`. */
export class MinHeap {
  private items: number[] = [];
  private priorities: number[] = [];

  get length(): number {
    return this.items.length;
  }

  clear(): void {
    this.items.length = 0;
    this.priorities.length = 0;
  }

  push(item: number, priority: number): void {
    const { items, priorities } = this;
    let i = items.length;
    items.push(item);
    priorities.push(priority);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (priorities[parent] <= priority) break;
      items[i] = items[parent];
      priorities[i] = priorities[parent];
      i = parent;
    }
    items[i] = item;
    priorities[i] = priority;
  }

  /** Removes and returns the item with the lowest priority. The heap must not be empty. */
  pop(): number {
    const { items, priorities } = this;
    const top = items[0];
    const item = items.pop() as number;
    const priority = priorities.pop() as number;
    const n = items.length;
    if (n === 0) return top;
    let i = 0;
    for (;;) {
      let child = 2 * i + 1;
      if (child >= n) break;
      if (child + 1 < n && priorities[child + 1] < priorities[child]) child++;
      if (priorities[child] >= priority) break;
      items[i] = items[child];
      priorities[i] = priorities[child];
      i = child;
    }
    items[i] = item;
    priorities[i] = priority;
    return top;
  }
}
