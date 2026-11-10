import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { SurfaceKind, SurfaceStyler } from '@rendering';
import { roadBounds, type Bounds } from '../layout/Bounds';
import type { TownLayout } from '../layout/TownLayout';
import type { TownRoad } from '../layout/TownRoad';
import { applyVerge } from './applyVerge';
import { groundPatch } from './groundPatch';
import { plazaShade } from './plazaShade';
import { roadShade } from './roadShade';

/** Lift above the ground so the strips never z-fight with the flattened terrain. */
const LIFT = 0.06;
/** The square lies this much above the roads that run in under it. */
const PLAZA_LIFT = 0.02;
/** Width in metres of the strip along each edge that frays into the terrain. */
const FEATHER = 0.7;
/** Roads continue this far under the square, so its frayed edge shows dirt instead of a gap. */
const OVERLAP = 1.2;
/** Metres per grid cell; only the edge cover and broad tints live on the vertices. */
const STEP = 0.5;

/** Builds textured packed-dirt roads and a cobbled square just above the ground, town-local: two meshes. */
export class RoadMeshFactory {
  private readonly cobble: THREE.Material;
  private readonly dirt: THREE.Material;

  constructor(surfaces?: SurfaceStyler) {
    this.cobble = groundMaterial('cobble', surfaces);
    this.dirt = groundMaterial('dirt', surfaces);
  }

  create(layout: TownLayout): THREE.Group {
    const group = new THREE.Group();
    const p = layout.plazaHalfSize;
    const plaza = { minX: -p, maxX: p, minZ: -p, maxZ: p };
    group.add(mesh(groundPatch(plaza, LIFT + PLAZA_LIFT, STEP, plazaShade(p * 2, FEATHER)), this.cobble));

    const strips = layout.roads.map((road) => {
      const alongX = road.from.z === road.to.z;
      return groundPatch(towardsPlaza(road, alongX), LIFT, STEP, roadShade(alongX, road.width, FEATHER));
    });
    if (strips.length > 0) {
      group.add(mesh(mergeGeometries(strips), this.dirt));
      for (const strip of strips) strip.dispose();
    }
    return group;
  }
}

/** The road's bounds, stretched at the end nearer the town centre so it runs in under the square. */
function towardsPlaza(road: TownRoad, alongX: boolean): Bounds {
  const b = roadBounds(road);
  if (alongX) {
    if (Math.abs(b.minX) < Math.abs(b.maxX)) b.minX -= OVERLAP;
    else b.maxX += OVERLAP;
  } else if (Math.abs(b.minZ) < Math.abs(b.maxZ)) b.minZ -= OVERLAP;
  else b.maxZ += OVERLAP;
  return b;
}

function groundMaterial(kind: SurfaceKind, surfaces?: SurfaceStyler): THREE.Material {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  surfaces?.apply(material, kind);
  applyVerge(material);
  return material;
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
  const result = new THREE.Mesh(geometry, material);
  result.receiveShadow = true;
  return result;
}
