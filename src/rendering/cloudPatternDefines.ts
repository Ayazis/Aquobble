import { CLOUD_PATTERN } from './cloudPattern';

const float = (value: number): string => value.toFixed(6);

/** `CLOUD_PATTERN` as GLSL defines plus its functions, ready to paste at the top of a shader. */
export function cloudPatternDefines(): string {
  const p = CLOUD_PATTERN;
  return [
    `#define CLOUD_ALTITUDE ${float(p.altitude)}`,
    `#define CLOUD_SCALE ${float(p.scale)}`,
    `#define CLOUD_WIND_X ${float(p.windX)}`,
    `#define CLOUD_WIND_Z ${float(p.windZ)}`,
    `#define CLOUD_COVER_LOW ${float(p.coverLow)}`,
    `#define CLOUD_COVER_HIGH ${float(p.coverHigh)}`,
    p.glsl,
  ].join('\n');
}
