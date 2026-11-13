import * as THREE from 'three';

/**
 * Bends a foliage geometry's normals outwards from `centre`, as if the crown were one rounded mass: light
 * then falls off smoothly across the whole crown instead of flickering leaf card by leaf card. `amount` 1
 * replaces the normals entirely; less keeps some of each leaf's own tilt.
 */
export function roundNormals(geometry: THREE.BufferGeometry, centre: THREE.Vector3, amount = 0.8): void {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  if (!positions || !normals) return;
  const out = new THREE.Vector3();
  const own = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    out.fromBufferAttribute(positions, i).sub(centre).normalize();
    own.fromBufferAttribute(normals, i).lerp(out, amount).normalize();
    normals.setXYZ(i, own.x, own.y, own.z);
  }
  normals.needsUpdate = true;
}

/** The point a crown's normals fan out from: the middle of its bounds, a third of the way up. */
export function crownCentre(geometry: THREE.BufferGeometry): THREE.Vector3 {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox ?? new THREE.Box3();
  const centre = box.getCenter(new THREE.Vector3());
  centre.y = box.min.y + (box.max.y - box.min.y) * 0.35;
  return centre;
}
