import type { WeatherMix } from '@weather';
import type { WeatherChoice } from './MenuSettings';

/** The fixed weather mix for a menu choice, or null to follow the schedule. */
export function weatherPreset(choice: WeatherChoice): WeatherMix | null {
  switch (choice) {
    case 'clear':
      return { overcast: 0, rain: 0, mist: 0 };
    case 'overcast':
      return { overcast: 1, rain: 0, mist: 0 };
    case 'rain':
      return { overcast: 1, rain: 1, mist: 0 };
    case 'mist':
      return { overcast: 0.3, rain: 0, mist: 1 };
    default:
      return null;
  }
}
