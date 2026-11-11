import type { GameWorld, Random, System } from '@core';
import type { RenderContext } from '@rendering';
import type { WaterLevel } from '@water';
import type { Wind } from '@wind';
import { RainField, RainSystem, Weather, WeatherSchedule, WeatherSystem, type RainSurface } from '@weather';
import type { InstalledEnvironment } from './installEnvironment';
import type { WaterReactions } from './installWaterReactions';

/** Lane G: weather. The live weather and its schedule; make it early, the wind reads it. */
export interface WeatherClock {
  weather: Weather;
  schedule: WeatherSchedule;
}

export function createWeather(random: Random): WeatherClock {
  return { weather: new Weather(), schedule: new WeatherSchedule(random.fork('weather')) };
}

/** Under a full grey sky the wind blows this much harder. */
export const OVERCAST_WIND_BOOST = 0.6;

/** What the weather lane needs from the rest of the game. */
export interface WeatherSites {
  world: GameWorld;
  render: RenderContext;
  env: InstalledEnvironment;
  water: WaterLevel;
  waterFx: WaterReactions;
  wind: Wind;
  random: Random;
  mobile: boolean;
  characterHeight: number;
}

/** Frame systems for the weather: run after the day cycle (overrides its sun, grade, fog and cloud shadow). */
export function installWeather(clock: WeatherClock, s: WeatherSites): System[] {
  const { env } = s;
  const shadow = env.lighting.cloudShadow;
  const control = new WeatherSystem(clock.weather, clock.schedule, () => env.dayNight.timeOfDay * 24, {
    setOvercast: (o) => {
      env.dayNight.overcast = o;
      shadow.params[1] *= 1 + 1.5 * o; // rewritten by the clouds every frame, so this never compounds
    },
    setMist: (m) => (env.dayNight.heightFog.mist = m),
    setWetness: (w) => {
      env.lighting.wetness[0] = w;
      env.lighting.wetness[1] = w;
    },
  });
  const rain = new RainField(s.mobile ? 500 : 1500, s.random.fork('rain'));
  s.render.scene.add(rain.mesh);
  const surface: RainSurface = {
    landingHeight: (x, z) => Math.max(s.water.surfaceAt(x, z), s.water.groundAt(x, z)),
    isWater: (x, z) => s.water.surfaceAt(x, z) > s.water.groundAt(x, z) + 0.02,
    ripple: (x, z, radius, strength) => s.waterFx.ripples.stamp(x, z, radius, strength),
    splash: (x, y, z) => s.waterFx.droplets.spawn({ x, y, z }, { x: 0, y: 1.2, z: 0 }, y, 0.02, false),
  };
  let t = 0;
  const windNow = () => {
    const d = s.wind.direction(t);
    const k = s.wind.strength(t);
    return { x: d.x * k, z: d.z * k };
  };
  const clockSystem: System = { update: (dt) => void (t += dt) };
  const rainSystem = new RainSystem(s.world, clock.weather, rain, s.render.camera, surface, windNow, s.characterHeight);
  return [control, clockSystem, rainSystem];
}
