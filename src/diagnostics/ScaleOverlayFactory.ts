import * as THREE from 'three';
import { labelSprite } from './labelSprite';
import { CHARACTER_HEIGHT, TARGET_DOOR_HEIGHT } from './scaleReference';

const FIGURE_COLOR = 0xff3366;
const TARGET_COLOR = 0x33ddff;
const MEASURED_COLOR = 0xffcc00;

/** Builds the three.js parts of the scale overlay: 1 m grid, 1.8 m figure and door-height markers. */
export class ScaleOverlayFactory {
  /** A grid of 1 m cells, `size` metres across, with a brighter line every 5 m. */
  grid(size = 40): THREE.Object3D {
    const group = new THREE.Group();
    const fine = new THREE.GridHelper(size, size, 0xffffff, 0xffffff);
    const coarse = new THREE.GridHelper(size, size / 5, 0xffee00, 0xffee00);
    const layers: [THREE.GridHelper, number][] = [
      [fine, 0.35],
      [coarse, 0.8],
    ];
    for (const [helper, opacity] of layers) {
      const material = helper.material as THREE.Material;
      material.transparent = true;
      material.opacity = opacity;
      material.depthTest = false;
      helper.renderOrder = 999;
      group.add(helper);
    }
    return group;
  }

  /** A 1.8 m tall standing figure (body, head and a height tick), feet at the origin. */
  figure(): THREE.Object3D {
    const material = new THREE.MeshBasicMaterial({ color: FIGURE_COLOR });
    const head = 0.24;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, CHARACTER_HEIGHT - head, 0.25), material);
    body.position.y = (CHARACTER_HEIGHT - head) / 2;
    const skull = new THREE.Mesh(new THREE.BoxGeometry(head, head, head), material);
    skull.position.y = CHARACTER_HEIGHT - head / 2;
    const label = labelSprite('1.8 m');
    label.position.y = CHARACTER_HEIGHT + 0.3;
    const group = new THREE.Group();
    group.add(body, skull, this.tick(CHARACTER_HEIGHT, FIGURE_COLOR, 0.8), label);
    return group;
  }

  /** Door markers for one building: the 2.25 m target bar, and the measured door height when known. */
  doorMarker(model: string, modelHeight: number, measured?: number): THREE.Object3D {
    const top = Math.max(modelHeight, TARGET_DOOR_HEIGHT);
    const door = measured === undefined ? 'door ?' : `door ${measured.toFixed(2)} m`;
    const label = labelSprite(`${model} ${modelHeight.toFixed(1)} m · ${door}`, 0.4);
    label.position.y = top + 0.6;
    const group = new THREE.Group();
    group.add(this.tick(TARGET_DOOR_HEIGHT, TARGET_COLOR, 1.6), this.pole(top), label);
    if (measured !== undefined) group.add(this.tick(measured, MEASURED_COLOR, 1.6));
    return group;
  }

  /** A horizontal bar `width` metres wide at `height`. */
  private tick(height: number, color: number, width: number): THREE.Object3D {
    const material = new THREE.MeshBasicMaterial({ color, depthTest: false });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.04), material);
    bar.position.y = height;
    bar.renderOrder = 1000;
    return bar;
  }

  /** A thin vertical pole with a mark every metre, for reading heights off. */
  private pole(height: number): THREE.Object3D {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, height, 0)];
    for (let y = 1; y <= height; y++) points.push(new THREE.Vector3(-0.2, y, 0), new THREE.Vector3(0.2, y, 0));
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, depthTest: false });
    const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), material);
    lines.renderOrder = 1000;
    return lines;
  }
}
