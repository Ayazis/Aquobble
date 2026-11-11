import type { System } from '@core';
import type { GustFronts } from './GustFronts';
import type { Wind } from './Wind';
import type { WindUniforms } from './WindUniforms';

/** Frame system: advances wind time and copies the wind's direction, strength and gust shape into the uniforms. */
export class WindSystem implements System {
  private time = 0;

  constructor(
    private readonly wind: Wind,
    private readonly uniforms: WindUniforms,
    private readonly fronts: GustFronts,
  ) {}

  /** Seconds of wind time so far; pass this as `t` when asking `Wind` from CPU code. */
  get elapsed(): number {
    return this.time;
  }

  update(dt: number): void {
    this.time += dt;
    const dir = this.wind.direction(this.time);
    this.uniforms.uWindDirection.value.set(dir.x, dir.z);
    this.uniforms.uWindStrength.value = this.wind.strength(this.time);
    this.uniforms.uWindTime.value = this.time;
    this.uniforms.uGustFronts.value.set(this.fronts.spacing, this.fronts.speed, this.fronts.phase);
  }
}
