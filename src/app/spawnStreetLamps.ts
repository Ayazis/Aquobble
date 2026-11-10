import type { GameWorld } from '@core';
import type {} from '@lighting';
import type { PlacedPlot } from '@town';

/** The town model that carries a lamp. */
export const LAMP_ASSET = 'lantern_post';

/**
 * Where the lamp glass hangs on the lantern-post model, as fractions of its footprint: up from the ground and
 * forward (local +z) from the post's centre. Measured from the model's glass faces.
 */
const GLASS_UP = 0.614;
const GLASS_FORWARD = 0.277;

/** Marks every lantern post among `props` as a street lamp, so it gets a pool of light and can take a real one. */
export function spawnStreetLamps(world: GameWorld, props: readonly PlacedPlot[]): void {
  for (const { plot, position } of props) {
    if (plot.assetId !== LAMP_ASSET) continue;
    const forward = plot.footprint.depth * GLASS_FORWARD;
    const x = position.x + Math.sin(plot.rotation) * forward;
    const z = position.z + Math.cos(plot.rotation) * forward;
    world.add({
      streetLamp: {
        glass: { x, y: position.y + plot.footprint.height * GLASS_UP, z },
        ground: { x, y: position.y, z },
      },
    });
  }
}
