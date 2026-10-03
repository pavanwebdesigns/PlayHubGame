/**
 * UTC midnight for this build. "New this week" stays the same for every build
 * on the same UTC date, and the value is not printed into HTML.
 */
export function buildToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
