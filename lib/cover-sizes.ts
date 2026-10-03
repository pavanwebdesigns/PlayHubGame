/** Row tiles are 10rem in every layout. */
export const ROW_SIZES = '10rem';

/**
 * Measured content width of a standard tile.
 * 390 → 171, 1024 with the rail → 220, 1440 with the rail open or closed → 173.
 */
export const TILE_SIZES =
  '(max-width: 480px) calc((100vw - 3rem) / 2), (max-width: 768px) calc((100vw - 4rem) / 3), (max-width: 1024px) calc((100vw - 5rem) / 4), 11rem';

/** The featured tile spans two columns. 390 → about 358, 1024 → 456, 1440 → 363. */
export const XL_SIZES =
  '(max-width: 480px) calc(100vw - 2rem), (max-width: 768px) calc((100vw - 4rem) / 1.5 + 1rem), (max-width: 1024px) calc((100vw - 5rem) / 2 + 1rem), 23rem';

/**
 * Spotlight image. 390 → 328, 1024 → 898, 1440 → 1090 with the rail open or closed.
 * The srcset goes to 1280 so a retina laptop is not stuck on 640.
 */
export const SPOTLIGHT_SIZES =
  '(max-width: 767px) calc(100vw - 1.5rem), (max-width: 1279px) calc(100vw - 8rem), 68rem';

/** Game page frame. The stage is the content width until the wide layout. */
export const PLAYER_SIZES = '(max-width: 1024px) calc(100vw - 2rem), 42rem';

export const TILE_WIDTHS = [240, 320, 480, 640] as const;
export const SPOTLIGHT_WIDTHS = [480, 640, 960, 1280] as const;
