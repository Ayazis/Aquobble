import { BEND_SPRING, springTerms } from './bendSpring';
import { MAX_BEND_STAMPS } from './BendStamp';

const f = (v: number) => v.toFixed(4);

export const BEND_UPDATE_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * One step of the bend map: scroll the previous map with the box, run each texel's damped spring
 * (push and its velocity), then press every stamp's soft disc in, pushing radially and along the mover's
 * velocity so grass parts in front and closes behind.
 */
export function bendUpdateFragment(): string {
  const { k, c } = springTerms();
  return /* glsl */ `
uniform sampler2D uPrev;
uniform vec2 uShift;
uniform vec3 uBox;
uniform float uDt;
uniform vec4 uDiscs[${MAX_BEND_STAMPS}];
uniform vec4 uMotion[${MAX_BEND_STAMPS}];
varying vec2 vUv;
void main() {
  vec2 uv = vUv + uShift;
  vec2 inside = step(0.0, uv) * step(uv, vec2(1.0));
  vec4 s = texture2D(uPrev, uv) * inside.x * inside.y;
  vec2 d = s.xy;
  vec2 v = s.zw;
  v += (-${f(k)} * d - ${f(c)} * v) * uDt;
  d += v * uDt;
  vec2 world = uBox.xy + (vUv - 0.5) * uBox.z;
  for (int i = 0; i < ${MAX_BEND_STAMPS}; i++) {
    vec4 disc = uDiscs[i];
    if (disc.z <= 0.0) continue;
    vec2 away = world - disc.xy;
    float dist = length(away);
    float reach = 1.0 - smoothstep(disc.z * 0.35, disc.z, dist);
    if (reach <= 0.0) continue;
    vec2 radial = dist > 0.001 ? away / dist : vec2(0.0);
    vec2 vel = uMotion[i].xy;
    float speed = length(vel);
    vec2 along = speed > 0.1 ? vel / speed : vec2(0.0);
    vec2 dir = radial + along * min(speed * 0.25, 1.2);
    float dirLen = length(dir);
    dir = dirLen > 0.001 ? dir / dirLen : radial;
    vec2 target = dir * disc.w * reach;
    float k = clamp(reach * ${f(BEND_SPRING.press)} * uDt, 0.0, 1.0);
    // Only push further: a blade already leaning more than this disc asks keeps its lean.
    if (dot(target, target) >= dot(d, d) * 0.9) {
      v = mix(v, (target - d) / max(uDt, 0.001) * 0.2, k);
      d = mix(d, target, k);
    }
  }
  gl_FragColor = vec4(d, v);
}
`;
}
