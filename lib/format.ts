export function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function orientationLabel(
  orientation: 'landscape' | 'portrait' | 'all',
): string {
  if (orientation === 'portrait') return 'Plays upright';
  if (orientation === 'landscape') return 'Best with your phone sideways';
  return 'Plays upright or sideways';
}
