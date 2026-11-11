/**
 * Crisp white foam for the water's colour chunk (needs `p`, `depth`, `a`, `b`, `uWaterNormals`, `rippleAt`).
 * Cel-shaded: foam is either there or not, with a broken edge from a fine noise layer, so patches tear apart
 * as they fade. Shore foam follows the tide (the water mesh itself rises) and laps up the beach with the
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
  float foam = 1.0 - step(edge, depth);
  // Bands rolling in towards the beach, torn by the grain.
  float lap = sin(depth * 18.0 - uWaterTime * 2.4 + a * 5.0);
  foam = max(foam, step(0.72, lap) * step(0.4, grain) * (1.0 - step(0.45 + 0.2 * b, depth)));
  foam *= mix(1.0, 0.25, uWaterCalm);
  // Footsteps, wakes and splash rings: crisp patches whose edges break up as the foam fades.
  float stamped = rippleAt(p).z;
  foam = max(foam, step(0.14 + 0.4 * grain, stamped));
  waterFoam = foam;
`;
