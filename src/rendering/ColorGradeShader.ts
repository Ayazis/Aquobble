/**
 * Final look, applied after tone mapping: saturation, filmic contrast (an S-curve round mid grey), a lift of
 * the blacks towards dark blue, a soft vignette and a breath of film grain. Saturation, contrast and lift
 * follow the hour (`ColorGrade`); the defaults are the noon look.
 */
export const ColorGradeShader = {
  name: 'ColorGradeShader',
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1.08 },
    contrast: { value: 1.06 },
    vignette: { value: 0.16 },
    grain: { value: 0.012 },
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
      // S-curve through mid grey: steeper in the middle, easing into black and white instead of clipping.
      vec3 curved = color * color * (3.0 - 2.0 * color);
      color = clamp(mix(color, curved, (contrast - 1.0) * 3.0), 0.0, 1.0);
      // After contrast, so contrast cannot crush the lifted shade back to black.
      color += lift * liftColor * (1.0 - color);
      vec2 fromCentre = vUv - 0.5;
      color *= 1.0 - vignette * smoothstep(0.25, 0.95, dot(fromCentre, fromCentre) * 2.0);
      float tooth = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);
      color *= 1.0 + grain * (tooth * 2.0 - 1.0);
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
    }
  `,
};
