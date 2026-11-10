/** Where the frame's draw-call and triangle counts come from (the renderer). */
export interface RenderStatsSource {
  stats(): { calls: number; triangles: number };
}
