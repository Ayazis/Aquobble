import * as THREE from 'three';

/**
 * Screen-space ink outlines in one pass. Edges come from the scene depth: 1/viewZ is linear across any flat
 * face in screen space, so its Laplacian is zero on faces and spikes where the surface normal turns (creases)
 * or where one object passes behind another (silhouettes). The line is the surface colour darkened and cooled,
 * never black, and fades out with distance so far hills stay soft.
 */
export const InkOutlineShader = {
  name: 'InkOutlineShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 2000 },
    /** One texel in UV; scaled by `stride` (2 on phones: lines drawn from a half-resolution sampling). */
    texel: { value: new THREE.Vector2(1 / 1024, 1 / 1024) },
    stride: { value: 1 },
    strength: { value: 0.75 },
    /** Ink as a multiple of the surface colour: darker and a little cooler. */
    ink: { value: new THREE.Vector3(0.32, 0.3, 0.38) },
    fadeStart: { value: 25 },
    fadeEnd: { value: 110 },
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
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform vec2 texel;
    uniform float stride;
    uniform float strength;
    uniform vec3 ink;
    uniform float fadeStart;
    uniform float fadeEnd;
    varying vec2 vUv;

    float viewDepth(vec2 uv) {
      return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cameraNear, cameraFar);
    }

    void main() {
      vec4 texel0 = texture2D(tDiffuse, vUv);
      vec2 o = texel * stride;
      float c = viewDepth(vUv);
      float l = viewDepth(vUv - vec2(o.x, 0.0));
      float r = viewDepth(vUv + vec2(o.x, 0.0));
      float d = viewDepth(vUv - vec2(0.0, o.y));
      float u = viewDepth(vUv + vec2(0.0, o.y));
      // Laplacian of 1/z relative to 1/z: unit-free, so the same threshold works near and far.
      float ic = 1.0 / c;
      float lap = abs(1.0 / l + 1.0 / r + 1.0 / d + 1.0 / u - 4.0 * ic) / ic;
      float crease = smoothstep(0.0015 * stride, 0.005 * stride, lap);
      // Silhouettes: a big jump in depth to the nearest neighbour; drawn on the near side only.
      float nearest = min(min(l, r), min(d, u));
      float farthest = max(max(l, r), max(d, u));
      float silhouette = smoothstep(0.04, 0.12, (farthest - c) / c) * step(c, nearest + 0.001 * c);
      float edge = max(crease * 0.7, silhouette);
      float fade = 1.0 - smoothstep(fadeStart, fadeEnd, c);
      vec3 color = mix(texel0.rgb, texel0.rgb * ink, edge * fade * strength);
      gl_FragColor = vec4(color, texel0.a);
    }
  `,
};
