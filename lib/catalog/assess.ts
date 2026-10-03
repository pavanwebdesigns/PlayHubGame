import { MAX_INVALID_RATIO, MIN_VALID_GAMES } from '@/config/site';

export function invalidRatio(valid: number, invalid: number): number {
  const total = valid + invalid;
  if (total === 0) return 1;
  return invalid / total;
}

export function catalogWithinThresholds(
  valid: number,
  invalid: number,
  minValid: number = MIN_VALID_GAMES,
  maxInvalidRatio: number = MAX_INVALID_RATIO,
): boolean {
  return valid >= minValid && invalidRatio(valid, invalid) <= maxInvalidRatio;
}
