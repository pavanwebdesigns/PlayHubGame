export const TILE_COLUMNS = [2, 3, 4, 6, 8] as const;
export type TileColumns = (typeof TILE_COLUMNS)[number];

/** Empty cells beside one 2×2 tile in its first two rows. */
export function featuredSideCells(columns: number): number {
  if (columns < 2) return 0;
  return 2 * (columns - 2);
}

/**
 * How many md tiles to show after one leading xl so the band beside it is
 * full and the last row has no empty cell.
 */
export function fullRowMdCount(columns: number, mdAvailable: number): number {
  if (columns < 2 || mdAvailable <= 0) return 0;
  const side = featuredSideCells(columns);
  if (mdAvailable < side) return mdAvailable;
  const extra = mdAvailable - side;
  return side + extra - (extra % columns);
}

/** Column counts where this md tile (0-based) is hidden to keep a full last row. */
export function mdHiddenAt(index: number, mdAvailable: number): TileColumns[] {
  return TILE_COLUMNS.filter(
    (columns) => index >= fullRowMdCount(columns, mdAvailable),
  );
}

/** Md tiles to render so every breakpoint can hide down to a full row. */
export function mdTilesToRender(available: number): number {
  const widest = Math.max(
    ...TILE_COLUMNS.map((columns) => featuredSideCells(columns)),
  );
  return Math.max(available, widest);
}
