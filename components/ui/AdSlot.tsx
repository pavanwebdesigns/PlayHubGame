type AdSlotProps = {
  minHeight: number;
  minWidth: number;
};

/** Reserves space. No ad script until Phase 6. */
export function AdSlot({ minHeight, minWidth }: AdSlotProps) {
  return (
    <div
      className="flex items-center justify-center rounded-tile border border-line bg-deck text-ui text-ink-muted"
      style={{ minHeight, minWidth }}
      role="complementary"
      aria-label="Advertisement"
    >
      Advertisement
    </div>
  );
}
