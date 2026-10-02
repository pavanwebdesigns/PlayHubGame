import { GAMEPIX_SID } from '@/config/site';
import { mapPool } from '@/lib/catalog/pool';

export type FeedFetchResult = {
  items: unknown[];
  pagesFetched: number;
  feedModified: string | null;
};

type FeedPage = {
  items: unknown[];
  nextUrl: string | null;
  lastPageUrl: string | null;
  modified: string | null;
};

const CONCURRENCY = 5;
const TIMEOUT_MS = 10_000;
const RETRIES = 3;

function readPage(value: unknown): FeedPage {
  if (!value || typeof value !== 'object')
    throw new Error('Feed page was not an object');
  const page = value as Record<string, unknown>;
  if (!Array.isArray(page.items))
    throw new Error('Feed page has no items array');
  return {
    items: page.items,
    nextUrl:
      typeof page.next_url === 'string' && page.next_url.length > 0
        ? page.next_url
        : null,
    lastPageUrl:
      typeof page.last_page_url === 'string' ? page.last_page_url : null,
    modified: typeof page.modified === 'string' ? page.modified : null,
  };
}

function withSid(value: string): string {
  const url = new URL(value);
  url.searchParams.set('sid', GAMEPIX_SID);
  return url.toString();
}

export function pageUrlsFromFirst(page: FeedPage): string[] {
  if (!page.lastPageUrl) return [];
  const last = new URL(withSid(page.lastPageUrl));
  const lastPage = Number(last.searchParams.get('page'));
  if (!Number.isInteger(lastPage) || lastPage < 1) {
    throw new Error(
      `Feed last_page_url has no page number: ${page.lastPageUrl}`,
    );
  }
  const urls: string[] = [];
  for (let number = 2; number <= lastPage; number += 1) {
    const url = new URL(last);
    url.searchParams.set('page', String(number));
    urls.push(url.toString());
  }
  return urls;
}

async function fetchJson(
  url: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
  retries: number,
): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to fetch ${url}`);
}

export async function fetchFeed(options: {
  startUrl: string;
  fetchImpl?: typeof fetch;
  concurrency?: number;
  timeoutMs?: number;
  retries?: number;
}): Promise<FeedFetchResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;
  const retries = options.retries ?? RETRIES;
  const concurrency = options.concurrency ?? CONCURRENCY;
  const startUrl = withSid(options.startUrl);

  const first = readPage(
    await fetchJson(startUrl, fetchImpl, timeoutMs, retries),
  );
  if (!first.lastPageUrl) {
    const items = [...first.items];
    let next = first.nextUrl ? withSid(first.nextUrl) : null;
    let pagesFetched = 1;
    const seen = new Set<string>([startUrl]);
    while (next && !seen.has(next) && pagesFetched < 400) {
      seen.add(next);
      const page = readPage(
        await fetchJson(next, fetchImpl, timeoutMs, retries),
      );
      items.push(...page.items);
      next = page.nextUrl ? withSid(page.nextUrl) : null;
      pagesFetched += 1;
    }
    return { items, pagesFetched, feedModified: first.modified };
  }

  const rest = pageUrlsFromFirst(first).map((url, index) => ({ url, index }));
  const pages: unknown[][] = Array.from({ length: rest.length }, () => []);
  await mapPool(rest, concurrency, async (pageUrl) => {
    const page = readPage(
      await fetchJson(pageUrl.url, fetchImpl, timeoutMs, retries),
    );
    pages[pageUrl.index] = page.items;
  });

  return {
    items: [first.items, ...pages].flat(),
    pagesFetched: 1 + rest.length,
    feedModified: first.modified,
  };
}
