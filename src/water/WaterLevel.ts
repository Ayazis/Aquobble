/** Port: where the water is right now, for simulation (buoyancy, contact, wading). */
export interface WaterLevel {
  /** World height of the water surface over (x, z), waves included. Below the ground where there is no water. */
  surfaceAt(x: number, z: number): number;
  /** World height of the ground (sea or pond floor) under (x, z). */
  groundAt(x: number, z: number): number;
}
