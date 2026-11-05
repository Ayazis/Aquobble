import * as THREE from 'three';

/** Placeholder low-poly trees (instanced). Swap for real models from public/assets later. */
export function scatterTrees(heightAt: (x: number, z: number) => number, count = 220): THREE.Group {
  const group = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2, 5).translate(0, 1, 0);
  const crownGeo = new THREE.ConeGeometry(1.6, 4, 6).translate(0, 3.8, 0);
  const trunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x6b4a2f, flatShading: true }), count);
  const crowns = new THREE.InstancedMesh(crownGeo, new THREE.MeshStandardMaterial({ color: 0x3d7a3a, flatShading: true, roughness: 0.9 }), count);

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const color = new THREE.Color();
  let placed = 0;
  for (let tries = 0; placed < count && tries < count * 20; tries++) {
    const x = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 160;
    const y = heightAt(x, z);
    if (y < 2 || y > 11) continue;
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
    s.setScalar(0.7 + Math.random() * 0.8);
    m.compose(p.set(x, y - 0.2, z), q, s);
    trunks.setMatrixAt(placed, m);
    crowns.setMatrixAt(placed, m);
    crowns.setColorAt(placed, color.setHSL(0.28 + Math.random() * 0.06, 0.45, 0.28 + Math.random() * 0.1));
    placed++;
  }
  trunks.count = crowns.count = placed;
  for (const mesh of [trunks, crowns]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}
