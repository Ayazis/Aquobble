import * as THREE from 'three';

const vec = () => ({ value: new THREE.Vector3() });
const colour = () => ({ value: new THREE.Color(0, 0, 0) });

/**
 * One set of uniforms for everything that draws the sky (dome, cloud map, cloud layer), so they can never
 * disagree about where the sun is or how hazy the air is. `SkyDome` writes them once a frame.
 */
export function createSkyUniforms() {
  return {
    // Atmosphere (see `ATMOSPHERE_PARS`).
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uBetaR: vec(),
    uBetaM: vec(),
    uSunE: { value: 1000 },
    uMieG: { value: 0.8 },
    // Dome extras: the sun's disc, the night gradient (already faded by how dark it is) and the afterglow.
    uSunDisc: colour(),
    uSkyNight: colour(),
    uNightZenith: colour(),
    uNightHorizon: colour(),
    uTwilight: colour(),
    // Clouds (see `cloudVolumeGlsl`).
    uCloudCam: vec(),
    uCloudTime: { value: 0 },
    uCloudCover: { value: 0 },
    uCloudLightDir: { value: new THREE.Vector3(0, 1, 0) },
    uCloudLight: colour(),
    uCloudAmbient: colour(),
    uCloudMap: { value: null as THREE.Texture | null },
    uCloudTexel: { value: 1 / 1024 },
  };
}

export type SkyUniforms = ReturnType<typeof createSkyUniforms>;
