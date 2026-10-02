/** Same height as a Continue playing row, so the real row can replace it. */
export function ContinueSkeleton() {
  return (
    <section aria-busy="true" aria-label="Continue playing">
      <div className="mb-3 min-h-tap" />
      <div className="flex">
        <span className="tile-row">
          <span className="cover-frame" />
          <span className="mt-1 block h-6" />
        </span>
      </div>
    </section>
  );
}
