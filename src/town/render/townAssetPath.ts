/** Site-relative path of the model for a layout asset id (`house_a` → `assets/models/town/house-a.glb`). */
export function townAssetPath(assetId: string): string {
  return `assets/models/town/${assetId.replace(/_/g, '-')}.glb`;
}
