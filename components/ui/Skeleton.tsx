type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  aspectRatio?: number | string;
};

export function Skeleton({ width, height, aspectRatio }: SkeletonProps) {
  return (
    <div
      className="animate-pulse rounded-tile bg-raised"
      style={{ width, height, aspectRatio }}
      aria-hidden="true"
    />
  );
}
