/**
 * White foam for the water's colour chunk (needs `p`, `depth`, `a`, `b`, `uWaterNormals`, `rippleAt`).
 * Soft-edged, broken up by a fine noise layer, so patches thin out and tear apart as they fade. Shore foam follows the tide (the water mesh itself rises) and laps up the beach with the
 * swash of the vertex shader; ripple stamps (steps, wakes, splashes) leave foam in the ripple map.
 * Writes `waterFoam` (0..1), which the emissive chunk lifts a little so foam still reads at night.
 */
export const WATER_FOAM_PARS = /* glsl */ `
float waterFoam = 0.0;
`;

export const WATER_FRAGMENT_FOAM = /* glsl */ `
  float grain = texture2D(uWaterNormals, p * 0.42 + uWaterTime * vec2(0.031, -0.024)).b;
  float lapse = 0.5 + 0.5 * sin(uWaterTime * 1.3 + dot(p, vec2(0.11, 0.07)) + a * 2.0);
  // A ragged solid band at the waterline that widens as each lap runs up and thins as it drains back.
  float edge = 0.07 + 0.2 * lapse + (grain - 0.5) * 0.18;
  float foam = 1.0 - smoothstep(edge * 0.55, edge, depth);
  // Bands rolling in towards the beach, torn by the grain.
  float lap = sin(depth * 18.0 - uWaterTime * 2.4 + a * 5.0);
  float band = smoothstep(0.78, 0.97, lap) * smoothstep(0.35, 0.6, grain);
  foam = max(foam, band * 0.6 * (1.0 - smoothstep(0.2, 0.4 + 0.2 * b, depth)));
  foam *= mix(1.0, 0.25, uWaterCalm);
  // Footsteps, wakes and splash rings: crisp patches whose edges break up as the foam fades.
  float stamped = rippleAt(p).z;
  foam = max(foam, smoothstep(0.1 + 0.4 * grain, 0.2 + 0.4 * grain, stamped));
  waterFoam = foam;
`;
