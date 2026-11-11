import type * as THREE from 'three';

/** Copies the opaque scene colour and packs the linear view depth (m) behind each pixel into alpha. */
export const SceneColourCopyShader = {
  uniforms: {
    tColour: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 2000 },
  },
  vertexShader: /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: /* glsl */ `
#include <packing>
uniform sampler2D tColour;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;
varying vec2 vUv;
void main() {
  float depth = texture2D(tDepth, vUv).x;
  float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
  gl_FragColor = vec4(texture2D(tColour, vUv).rgb, -viewZ);
}
`,
};
