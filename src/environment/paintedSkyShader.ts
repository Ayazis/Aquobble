import * as THREE from 'three';

/** How many flat colour bands the gradient is cut into, like strokes of a wide brush. */
const BANDS = 7;

/**
 * Banded horizon-to-zenith gradient. Bands are softened at their edges and wobble slightly with direction,
 * so they read as painted strokes rather than posterised banding; a sun-coloured wash warms the sky near
 * the sun. Colours are sRGB hex from the colour script, converted to linear by `THREE.Color`.
 */
export function paintedSkyShader(): Pick<
  THREE.ShaderMaterialParameters,
  'uniforms' | 'vertexShader' | 'fragmentShader'
> {
  return {
    uniforms: {
      zenith: { value: new THREE.Color(0x4f8fd8) },
      horizon: { value: new THREE.Color(0xbfe0f2) },
      sunColor: { value: new THREE.Color(0xfff2dc) },
      sunDirection: { value: new THREE.Vector3(0, 1, 0) },
      brightness: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 zenith;
      uniform vec3 horizon;
      uniform vec3 sunColor;
      uniform vec3 sunDirection;
      uniform float brightness;
      varying vec3 vDir;
      void main() {
        vec3 dir = normalize(vDir);
        float up = max(dir.y, 0.0);
        // Painted strokes: a gentle wobble across the sky before quantising into bands.
        float wobble = 0.025 * sin(dir.x * 7.0 + dir.z * 4.0) + 0.015 * sin(dir.z * 13.0 - dir.x * 5.0);
        float t = pow(clamp(up + wobble, 0.0, 1.0), 0.55) * ${BANDS.toFixed(1)};
        float band = floor(t);
        float edge = smoothstep(0.82, 1.0, fract(t));
        float banded = (band + edge) / ${BANDS.toFixed(1)};
        vec3 color = mix(horizon, zenith, banded);
        // Warm wash around the sun, strongest near the horizon, also banded.
        float toSun = max(dot(dir, normalize(sunDirection)), 0.0);
        float wash = floor(pow(toSun, 6.0) * 4.0) / 4.0 * (1.0 - 0.6 * up);
        color = mix(color, sunColor, wash * 0.45 * smoothstep(-0.25, 0.1, sunDirection.y));
        // Pre-brightened so the hour's exposure and ACES in the output pass land on the scripted colours.
        gl_FragColor = vec4(color * brightness, 1.0);
      }
    `,
  };
}
