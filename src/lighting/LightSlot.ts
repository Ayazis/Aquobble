/** One real light's assignment for this frame. */
export interface LightSlot {
  /** Index of the lamp this light stands in for, or -1 when there are fewer lamps than lights. */
  lamp: number;
  /** 0..1 strength: fades to 0 as the lamp is about to lose its light to a nearer one, so swaps never pop. */
  weight: number;
}
