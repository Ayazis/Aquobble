/**
 * Final look, applied after tone mapping: saturation, contrast, a lift of the blacks towards dark blue and a
 * soft vignette and a still paper grain. Saturation, contrast and lift follow the hour (`ColorGrade`); the defaults are the noon look.
 */
export const ColorGradeShader = {
  name: 'ColorGradeShader',
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1.22 },
    contrast: { value: 0.94 },
    vignette: { value: 0.14 },
    // Fixed paper grain: a still, fine tooth over the frame so it reads as painted on paper, not as film noise.
    grain: { value: 0.035 },
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
    uniform float grain;
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
      vec2 cell = floor(gl_FragCoord.xy);
      float tooth = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
      float fibre = fract(sin(dot(floor(cell / vec2(3.0, 1.0)), vec2(39.346, 11.135))) * 24634.6345);
      color *= 1.0 + grain * ((tooth + fibre) - 1.0);
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
    }
  `,
};
