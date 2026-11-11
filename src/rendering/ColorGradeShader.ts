/**
 * Final look, applied after tone mapping: saturation, contrast, a lift of the blacks towards dark blue and a
 * soft vignette. Saturation, contrast and lift follow the hour (`ColorGrade`); the defaults are the noon look.
 */
export const ColorGradeShader = {
  name: 'ColorGradeShader',
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1.22 },
    contrast: { value: 1.06 },
    vignette: { value: 0.22 },
    lift: { value: 0 },
    liftColor: { value: [0.45, 0.6, 1.0] },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float saturation;
    uniform float contrast;
    uniform float vignette;
    uniform float lift;
    uniform vec3 liftColor;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, saturation);
      color = clamp((color - 0.5) * contrast + 0.5, 0.0, 1.0);
      // After contrast, so contrast cannot crush the lifted shade back to black.
      color += lift * liftColor * (1.0 - color);
      vec2 fromCentre = vUv - 0.5;
      color *= 1.0 - vignette * smoothstep(0.25, 0.95, dot(fromCentre, fromCentre) * 2.0);
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
    }
  `,
};
