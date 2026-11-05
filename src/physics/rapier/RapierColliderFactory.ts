import RAPIER from '@dimforge/rapier3d-compat';
import type { ColliderShape, HeightFieldShape } from '../ColliderShape';

/** Translates engine-agnostic shapes into Rapier collider descriptors. */
export class RapierColliderFactory {
  create(shape: ColliderShape): RAPIER.ColliderDesc {
    switch (shape.type) {
      case 'ball':
        return RAPIER.ColliderDesc.ball(shape.radius);
      case 'capsule':
        return RAPIER.ColliderDesc.capsule(shape.halfHeight, shape.radius);
      case 'cylinder':
        return RAPIER.ColliderDesc.cylinder(shape.halfHeight, shape.radius);
      case 'cuboid':
        return RAPIER.ColliderDesc.cuboid(shape.halfExtents.x, shape.halfExtents.y, shape.halfExtents.z);
      case 'convexHull': {
        const desc = RAPIER.ColliderDesc.convexHull(shape.points);
        if (!desc) throw new Error('Convex hull could not be computed from the given points.');
        return desc;
      }
      case 'trimesh':
        return RAPIER.ColliderDesc.trimesh(shape.vertices, shape.indices);
      case 'heightField':
        return this.heightField(shape);
    }
  }

  /**
   * Rapier wants a column-major matrix with Rapier "rows" along x, "columns" along z, and the
   * counts given as subdivisions (samples - 1).
   */
  private heightField(shape: HeightFieldShape): RAPIER.ColliderDesc {
    const { rows, columns, heights } = shape;
    const matrix = new Float32Array(rows * columns);
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < columns; x++) matrix[x * rows + z] = heights[z * columns + x];
    }
    return RAPIER.ColliderDesc.heightfield(columns - 1, rows - 1, matrix, { x: shape.size.x, y: 1, z: shape.size.z });
  }
}
