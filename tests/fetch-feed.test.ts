import { describe, expect, it } from 'vitest';
import { fetchFeed } from '@/lib/catalog/fetch-feed';

describe('fetchFeed', () => {
  it('fetches every page from last_page_url and keeps sid', async () => {
    const calls: string[] = [];
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      const page = new URL(url).searchParams.get('page');
      return new Response(
        JSON.stringify({
          items: [{ id: page }],
          next_url: null,
          last_page_url:
            page === '1'
              ? 'https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page=3'
              : null,
          modified: 'Fri, 02 Oct 2026 00:05:31 GMT',
        }),
      );
    };

    const result = await fetchFeed({
      startUrl: 'https://feeds.gamepix.com/v2/json?pagination=96&page=1',
      fetchImpl,
      retries: 0,
    });

    expect(result.pagesFetched).toBe(3);
    expect(result.items).toHaveLength(3);
    expect(
      calls.every((url) => new URL(url).searchParams.get('sid') === 'LC991'),
    ).toBe(true);
  });

  it('retries a failed page', async () => {
    let attempts = 0;
    const fetchImpl = async () => {
      attempts += 1;
      if (attempts < 3) throw new Error('HTTP 500');
      return new Response(
        JSON.stringify({
          items: [{ id: '1' }],
          next_url: null,
          last_page_url:
            'https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page=1',
          modified: null,
        }),
      );
    };

    const result = await fetchFeed({
      startUrl:
        'https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page=1',
      fetchImpl,
      retries: 3,
    });
    expect(result.items).toHaveLength(1);
    expect(attempts).toBe(3);
  });
});
