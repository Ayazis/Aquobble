import { SKY_SCALE } from './Atmosphere';

/**
 * GLSL for the analytic sky (Preetham daylight model, after three.js's `Sky` shader, MIT): the colour of the
 * clear sky in a direction. The coefficients come from `Atmosphere` on the CPU, so the sun light matches.
 * Output is linear HDR in scene units (a clear zenith is about 0.2, the horizon two to three times that).
 */
export const ATMOSPHERE_PARS = /* glsl */ `
uniform vec3 uSunDir;
uniform vec3 uBetaR;
uniform vec3 uBetaM;
uniform float uSunE;
uniform float uMieG;

const float SKY_PI = 3.141592653589793;

// Share of light that survives the air along a ray at height dirY.
vec3 skyExtinction(float dirY) {
  float zenith = acos(clamp(dirY, 0.0, 1.0));
  float inverse = 1.0 / (cos(zenith) + 0.15 * pow(93.885 - degrees(zenith), -1.253));
  return exp(-(uBetaR * 8.4e3 + uBetaM * 1.25e3) * inverse);
}

float skyHenyey(float cosTheta, float g) {
  float g2 = g * g;
  return 0.07957747 * (1.0 - g2) / pow(1.0 - 2.0 * g * cosTheta + g2, 1.5);
}

// Sunlight scattered towards the viewer along dir, plus the extinction it leaves for what lies behind.
vec3 skyScatter(vec3 dir, out vec3 Fex) {
  Fex = skyExtinction(dir.y);
  float cosTheta = dot(dir, uSunDir);
  float half01 = cosTheta * 0.5 + 0.5;
  vec3 betaRTheta = uBetaR * (0.05968310 * (1.0 + half01 * half01));
  vec3 betaMTheta = uBetaM * skyHenyey(cosTheta, uMieG);
  vec3 ratio = uSunE * (betaRTheta + betaMTheta) / (uBetaR + uBetaM);
  vec3 Lin = pow(ratio * (1.0 - Fex), vec3(1.5));
  Lin *= mix(vec3(1.0), sqrt(ratio * Fex), clamp(pow(1.0 - uSunDir.y, 5.0), 0.0, 1.0));
  return Lin * ${(0.04 * SKY_SCALE).toFixed(5)};
}
`;
