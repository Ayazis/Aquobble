/** Engine-agnostic collider shapes. Dimensions in metres. */
export type ColliderShape =
  | { type: 'ball'; radius: number }
  | { type: 'capsule'; halfHeight: number; radius: number }
  | { type: 'cylinder'; halfHeight: number; radius: number }
  | { type: 'cuboid'; halfExtents: { x: number; y: number; z: number } }
  | { type: 'convexHull'; points: Float32Array }
  | TriMeshShape
  | HeightFieldShape;

/**
 * Regular height grid centred on the body origin.
 * `heights` is row-major: index = row * columns + column, rows along +z, columns along +x.
 */
export interface HeightFieldShape {
  type: 'heightField';
  rows: number;
  columns: number;
  heights: Float32Array;
  /** Total extent of the grid on x and z. */
  size: { x: number; z: number };
}

/**
 * Triangle mesh in body-local space: `vertices` is xyz-interleaved, `indices` lists three vertex indices per triangle.
 * Meant for fixed bodies (buildings, props); dynamic bodies should use a convex hull instead.
 */
export interface TriMeshShape {
  type: 'trimesh';
  vertices: Float32Array;
  indices: Uint32Array;
}
