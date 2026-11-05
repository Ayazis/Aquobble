import * as THREE from 'three';
import { roadBounds, type Bounds } from '../layout/Bounds';
import type { TownLayout } from '../layout/TownLayout';

/** Lift above the ground so the strips never z-fight with the flattened terrain. */
const LIFT = 0.06;

/** Builds the roads and the paved square as flat strips just above the ground, town-local. */
export class RoadMeshFactory {
  private readonly road = new THREE.MeshStandardMaterial({ color: 0x9b8366, roughness: 1 });
  private readonly plaza = new THREE.MeshStandardMaterial({ color: 0xa59a8a, roughness: 1 });

  create(layout: TownLayout): THREE.Group {
    const group = new THREE.Group();
    const p = layout.plazaHalfSize;
    group.add(this.strip({ minX: -p, maxX: p, minZ: -p, maxZ: p }, this.plaza, LIFT + 0.01));
    for (const road of layout.roads) group.add(this.strip(roadBounds(road), this.road, LIFT));
    return group;
  }

  private strip(b: Bounds, material: THREE.Material, y: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(b.maxX - b.minX, b.maxZ - b.minZ).rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((b.minX + b.maxX) / 2, y, (b.minZ + b.maxZ) / 2);
    mesh.receiveShadow = true;
    return mesh;
  }
}
