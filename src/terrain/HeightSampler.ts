/** Anything that can answer "how high is the ground here?". Used by placement code. */
export interface HeightSampler {
  heightAt(x: number, z: number): number;
}
