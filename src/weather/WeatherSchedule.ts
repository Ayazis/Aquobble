import type { Random } from '@core';
import type { WeatherKind } from './WeatherKind';
import type { WeatherMix } from './WeatherMix';

/** Hours per weather slot: four slots a day. */
const SLOT_HOURS = 6;
/** Hours either side of a slot boundary over which two states blend. */
const BLEND_HOURS = 1.5;
/** Chance of each state per slot (clear is the rest). */
const OVERCAST_CHANCE = 0.3;
const RAIN_CHANCE = 0.18;
/** Chance a dawn brings mist, when it is thickest (hour) and how long it lingers (hours). */
const MIST_CHANCE = 0.55;
const MIST_PEAK = 6.5;
const MIST_SPREAD = 2;

const MIXES: Record<WeatherKind, WeatherMix> = {
  clear: { overcast: 0, rain: 0, mist: 0 },
  overcast: { overcast: 1, rain: 0, mist: 0 },
  lightRain: { overcast: 1, rain: 1, mist: 0 },
};

interface DayPlan {
  slots: WeatherKind[];
  mist: number;
}

/**
 * Seeded weather as part of the day cycle: each six-hour slot of each day is clear, overcast or light rain,
 * blended over the slot edges, plus morning mist on some dawns. Every day is drawn from its own forked stream,
 * so the schedule is the same for a seed no matter in which order it is sampled.
 */
export class WeatherSchedule {
  private readonly days = new Map<number, DayPlan>();

  constructor(private readonly random: Random) {}

  /** The state of slot `slot` on day `day`; slots past 3 or below 0 roll over into the next or previous day. */
  kindAt(day: number, slot: number): WeatherKind {
    const d = day + Math.floor(slot / 4);
    return this.plan(d).slots[((slot % 4) + 4) % 4];
  }

  /** The blended mix at `hour` in [0, 24) of day `day` (0 = the first day). */
  mixAt(day: number, hour: number): WeatherMix {
    const slot = Math.floor(hour / SLOT_HOURS);
    const into = hour - slot * SLOT_HOURS;
    const here = MIXES[this.kindAt(day, slot)];
    let mix = here;
    if (into > SLOT_HOURS - BLEND_HOURS) {
      const t = smooth((into - SLOT_HOURS + BLEND_HOURS) / (2 * BLEND_HOURS));
      mix = blend(here, MIXES[this.kindAt(day, slot + 1)], t);
    } else if (into < BLEND_HOURS) {
      const t = smooth((into + BLEND_HOURS) / (2 * BLEND_HOURS));
      mix = blend(MIXES[this.kindAt(day, slot - 1)], here, t);
    }
    const dawn = Math.exp(-(((hour - MIST_PEAK) / MIST_SPREAD) ** 2));
    return { ...mix, mist: Math.max(mix.mist, this.plan(day).mist * dawn) };
  }

  private plan(day: number): DayPlan {
    let entry = this.days.get(day);
    if (!entry) {
      const r = this.random.fork(`day${day}`);
      const slots = [0, 1, 2, 3].map((): WeatherKind => {
        const roll = r.next();
        if (roll < RAIN_CHANCE) return 'lightRain';
        return roll < RAIN_CHANCE + OVERCAST_CHANCE ? 'overcast' : 'clear';
      });
      // The first morning is always fair, so the game opens on the island at its best.
      if (day === 0) slots[1] = 'clear';
      entry = { slots, mist: r.next() < MIST_CHANCE ? r.range(0.5, 1) : 0 };
      this.days.set(day, entry);
    }
    return entry;
  }
}

function smooth(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function blend(a: WeatherMix, b: WeatherMix, t: number): WeatherMix {
  return {
    overcast: a.overcast + (b.overcast - a.overcast) * t,
    rain: a.rain + (b.rain - a.rain) * t,
    mist: a.mist + (b.mist - a.mist) * t,
  };
}
