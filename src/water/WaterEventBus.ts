import type { WaterEvent, WaterEventType } from './WaterEvent';

type Listener<T extends WaterEventType> = (event: Extract<WaterEvent, { type: T }>) => void;

/** Small typed event bus: water systems emit, effects and (later) audio listen. Synchronous. */
export class WaterEventBus {
  private readonly listeners = new Map<WaterEventType, ((event: WaterEvent) => void)[]>();

  /** Subscribes to one event type; returns the unsubscribe function. */
  on<T extends WaterEventType>(type: T, listener: Listener<T>): () => void {
    const list = this.listeners.get(type) ?? [];
    const wrapped = listener as (event: WaterEvent) => void;
    list.push(wrapped);
    this.listeners.set(type, list);
    return () => {
      const i = list.indexOf(wrapped);
      if (i >= 0) list.splice(i, 1);
    };
  }

  emit(event: WaterEvent): void {
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
  }
}
