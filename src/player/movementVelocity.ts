import type { PlayerInput } from './PlayerInput';

/**
 * Horizontal velocity (m/s) for an input, relative to the camera yaw (0 = looking along -z).
 * Diagonals are normalised so they are not faster than straight movement.
 */
export function movementVelocity(
  input: PlayerInput,
  cameraYaw: number,
  walkSpeed: number,
  runSpeed: number,
): { x: number; z: number } {
  const length = Math.hypot(input.forward, input.right);
  if (length === 0) return { x: 0, z: 0 };
  const scale = (input.run ? runSpeed : walkSpeed) / Math.max(length, 1);
  const sin = Math.sin(cameraYaw);
  const cos = Math.cos(cameraYaw);
  // forward = (-sin, -cos), right = (cos, -sin)
  return {
    x: (-sin * input.forward + cos * input.right) * scale,
    z: (-cos * input.forward - sin * input.right) * scale,
  };
}
