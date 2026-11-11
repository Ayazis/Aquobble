import * as THREE from 'three';

/** A window on a model's front, as fractions of its bounding box: across (0 left..1 right), up, and pane size. */
interface Pane {
  across: number;
  up: number;
  width: number;
  height: number;
}

const row = (up: number, ...across: number[]): Pane[] =>
  across.map((a) => ({ across: a, up, width: 0.09, height: 0.1 }));

/**
 * Painted panes for the models whose textures have no dark window swatch (item 0.6). Positions are estimates on
 * the front face, kept clear of the door in the middle.
 */
const PANES: Record<string, Pane[]> = {
  house_c: [...row(0.35, 0.2, 0.8), ...row(0.62, 0.2, 0.5, 0.8)],
  barracks: [...row(0.3, 0.22, 0.78), ...row(0.55, 0.22, 0.5, 0.78)],
  watchtower: [{ across: 0.5, up: 0.72, width: 0.16, height: 0.06 }],
  windmill: [{ across: 0.5, up: 0.45, width: 0.08, height: 0.07 }],
};

const NAME = 'window-panes';

/**
 * Adds flat window panes to the front (+z) of building models that lack them. Their material carries a 1 x 1
 * near-black map, the colour `NightGlow.windows` picks as glass, so the panes light up at night with the rest.
 */
export class WindowPanes {
  private readonly material: THREE.MeshStandardMaterial;

  constructor() {
    const texture = new THREE.DataTexture(new Uint8Array([6, 6, 8, 255]), 1, 1);
    texture.needsUpdate = true;
    this.material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3 });
  }

  /** Adds panes to every listed model in `models` (once; repeated calls do nothing). */
  addTo(models: ReadonlyMap<string, THREE.Object3D>): void {
    for (const [id, model] of models) {
      const panes = PANES[id];
      if (!panes || model.getObjectByName(NAME)) continue;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const geometries = panes.map((p) =>
        new THREE.PlaneGeometry(p.width * size.x, p.height * size.y).translate(
          box.min.x + p.across * size.x,
          box.min.y + p.up * size.y,
          box.max.z - size.z * 0.002,
        ),
      );
      const group = new THREE.Group();
      group.name = NAME;
      for (const g of geometries) group.add(new THREE.Mesh(g, this.material));
      model.add(group);
    }
  }
}
