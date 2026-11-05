import * as THREE from 'three';
import type { RockModel, RockModelFactory } from './RockModelFactory';

/** Uses a loaded model (e.g. a glTF from public/assets/) as the rock, scaled so its bounding sphere matches the radius. */
export class ModelRockFactory implements RockModelFactory {
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.Material | THREE.Material[];

  constructor(template: THREE.Object3D) {
    let source: THREE.Mesh | undefined;
    template.updateWorldMatrix(true, true);
    template.traverse((o) => {
      if (!source && o instanceof THREE.Mesh) source = o;
    });
    if (!source) throw new Error('ModelRockFactory: model contains no mesh');

    // Bake the node transform in and centre on the origin, normalised to radius 1.
    this.geometry = toFloat(source.geometry).applyMatrix4(source.matrixWorld);
    this.geometry.computeBoundingSphere();
    const sphere = this.geometry.boundingSphere ?? new THREE.Sphere();
    this.geometry.translate(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    this.geometry.scale(1 / sphere.radius, 1 / sphere.radius, 1 / sphere.radius);
    this.material = source.material;
  }

  create(radius: number): RockModel {
    const geometry = this.geometry.clone().scale(radius, radius, radius);
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return { mesh, hullPoints: Float32Array.from(geometry.attributes.position.array) };
  }
}

/** Meshopt-compressed models use quantised (normalised int) attributes; copy them to plain floats so transforms don't clip. */
function toFloat(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(src.attributes)) {
    const a = attr as THREE.BufferAttribute;
    const data = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++)
      for (let c = 0; c < a.itemSize; c++) data[i * a.itemSize + c] = a.getComponent(i, c);
    out.setAttribute(name, new THREE.BufferAttribute(data, a.itemSize));
  }
  if (src.index) out.setIndex(src.index.clone());
  return out;
}
