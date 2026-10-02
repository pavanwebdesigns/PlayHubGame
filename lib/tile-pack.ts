/** Empty cells beside one 2×2 tile in its first two rows. */
export function featuredSideCells(columns: number): number {
  if (columns < 2) return 0;
  return 2 * (columns - 2);
}

/** Md tiles needed so that 2×2 tile does not leave a gap beside it. */
export function mdCountForPackedGrid(
  columns: number,
  mdAvailable: number,
): number {
  return Math.max(mdAvailable, featuredSideCells(columns));
}
