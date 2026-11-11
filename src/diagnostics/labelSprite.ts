import * as THREE from 'three';

/** A camera-facing text label, `height` metres tall, drawn on top of everything. */
export function labelSprite(text: string, height = 0.35, color = '#ffffff'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = '48px ui-monospace, monospace';
  canvas.height = 64;
  if (ctx) {
    ctx.font = font;
    canvas.width = Math.ceil(ctx.measureText(text).width) + 16;
    ctx.font = font; // resizing the canvas resets the context
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 8, 34);
  }
  const material = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set((height * canvas.width) / canvas.height, height, 1);
  sprite.renderOrder = 1000;
  return sprite;
}
