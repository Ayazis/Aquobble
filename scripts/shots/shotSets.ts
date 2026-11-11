import { VIEWS, type ShotView } from './views';

/** A named group of views shot at fixed times, optionally with extra URL flags (e.g. the scale overlay). */
export interface ShotSet {
  views: ShotView[];
  /** Time names from TIMES; the --times flag still narrows them. */
  times: string[];
  /** Appended to `?debug`, e.g. `&scale`. */
  query?: string;
}

const view = (name: string): ShotView => {
  const found = VIEWS.find((v) => v.name === name);
  if (!found) throw new Error(`Unknown view ${name}`);
  return found;
};

/**
 * The shot sets of graphics plan 6.1 / W0-a. `default` is every reference view at every time (the old behaviour).
 * The views are starting poses for the default world (seed 1337); refine them once the scale pass moves buildings.
 */
export const SHOT_SETS: Record<string, ShotSet> = {
  default: { views: VIEWS, times: ['morning', 'noon', 'sunset', 'night'] },
  // Character-height figure at a door, under a lamp, and next to each building type, with the 1 m grid.
  scale: {
    query: '&scale',
    times: ['noon'],
    views: [
      { name: 'scale-door', from: [6, 1.7, 2], at: [12, 1.5, 6] },
      { name: 'scale-house', from: [9, 1.6, 4], at: [16, 2.5, 8] },
      { name: 'scale-lamp', from: [2.5, 1.7, 13], at: [0, 2, 9] },
      { name: 'scale-plaza', from: [8, 4, 10], at: [0, 1, 0] },
      { name: 'scale-wall', from: [5, 1.7, 19], at: [9, 1.6, 23.5] },
      { name: 'scale-gate', from: [0, 1.6, 33], at: [0, 2, 26] },
      { name: 'scale-town', from: [30, 18, 30], at: [0, 2, 0], absolute: true },
    ],
  },
  water: {
    times: ['noon', 'sunset'],
    views: [view('pond'), view('coast'), view('shore'), view('shore-rocks'), { name: 'water-low', from: [3, 0.6, 50], at: [0, 0.2, 60] }],
  },
  village: {
    times: ['morning', 'noon'],
    views: [view('plaza'), view('lane'), view('street'), view('house'), view('wall'), view('gate'), view('overview')],
  },
  night: {
    times: ['night'],
    views: [view('plaza'), view('street'), view('lane'), view('gate'), view('shore'), view('meadow')],
  },
};
