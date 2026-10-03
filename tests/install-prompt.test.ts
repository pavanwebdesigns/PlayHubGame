import { describe, expect, it } from 'vitest';
import { installEligible } from '@/lib/install-prompt';

describe('install prompt', () => {
  it('stays hidden on the first visit and after dismiss', () => {
    expect(installEligible([], false)).toBe(false);
    expect(
      installEligible(
        [
          { slug: 'a', at: '2026-10-01T00:00:00.000Z' },
          { slug: 'b', at: '2026-10-01T00:00:00.000Z' },
          { slug: 'c', at: '2026-10-02T00:00:00.000Z' },
        ],
        true,
      ),
    ).toBe(false);
  });

  it('shows after three games on two days', () => {
    expect(
      installEligible(
        [
          { slug: 'a', at: '2026-10-01T00:00:00.000Z' },
          { slug: 'b', at: '2026-10-01T00:00:00.000Z' },
          { slug: 'c', at: '2026-10-02T00:00:00.000Z' },
        ],
        false,
      ),
    ).toBe(true);
  });
});
