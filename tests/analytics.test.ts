import { afterEach, describe, expect, it } from 'vitest';
import { eventParams, pageType, shouldTrack, track, type AnalyticsEvent } from '@/lib/analytics';

describe('analytics consent', () => {
  const calls: unknown[][] = [];

  afterEach(() => {
    delete process.env.PH_MAIN_BUILD;
    Reflect.deleteProperty(globalThis, 'window');
    calls.length = 0;
  });

  it('stays closed without consent', () => {
    expect(shouldTrack({ consent: false, mainBuild: false, debug: false })).toBe(false);
    expect(shouldTrack({ consent: false, mainBuild: true, debug: true })).toBe(false);
  });

  it('names the page from the path', () => {
    expect(pageType('/')).toBe('home');
    expect(pageType('/game/prism-match-3d/')).toBe('game');
    expect(pageType('/category/puzzle/')).toBe('category');
  });

  it('opens for consent, and for the preview debug query only off main', () => {
    expect(shouldTrack({ consent: true, mainBuild: true, debug: false })).toBe(true);
    expect(shouldTrack({ consent: false, mainBuild: false, debug: true })).toBe(true);
  });

  it('does not call gtag before consent', () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: { getItem: () => null },
      location: { search: '?ph_debug_analytics=1' },
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
    };
    process.env.PH_MAIN_BUILD = '1';
    const event: AnalyticsEvent = { name: 'favorite_add', slug: 'prism-match-3d' };
    track(event);
    expect(calls).toEqual([]);
    expect(eventParams(event)).toEqual({ slug: 'prism-match-3d' });
  });

  it('sends the event when the preview debug query is set', () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: { getItem: () => null },
      location: { search: '?ph_debug_analytics=1' },
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
    };
    track({ name: 'search_no_results', term: 'zzz', results: 0 });
    expect(calls).toEqual([['event', 'search_no_results', { term: 'zzz', results: 0 }]]);
  });
});
