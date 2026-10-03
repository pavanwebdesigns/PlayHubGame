export const SITE_NAME = 'PlayHubPlace';
export const SITE_URL = 'https://playhubplace.com';
export const GAMEPIX_SID = 'LC991';
export const DEFAULT_TITLE = 'PlayHubPlace - Free Online Games';
export const DEFAULT_DESCRIPTION =
  'PlayHubPlace - Play thousands of free online games instantly.';

/** Replace this sentinel with a real address before the contact link goes live. */
export const CONTACT_EMAIL = 'TODO(Pavan)';

/** Replace this sentinel with the GA4 id before analytics can send. */
export const GA4_MEASUREMENT_ID = 'TODO(Pavan)';

/** Fail the catalog build below this many valid games. */
export const MIN_VALID_GAMES = 10_000;

/** Fail the catalog build when dropped items exceed this share of valid + invalid. */
export const MAX_INVALID_RATIO = 0.01;

export const FEED_PAGE_SIZE = 96;

export function feedStartUrl(): string {
  const url = new URL('https://feeds.gamepix.com/v2/json');
  url.searchParams.set('sid', GAMEPIX_SID);
  url.searchParams.set('pagination', String(FEED_PAGE_SIZE));
  url.searchParams.set('page', '1');
  return url.toString();
}

export function contactEmailPublished(): boolean {
  return CONTACT_EMAIL.length > 0 && !CONTACT_EMAIL.startsWith('TODO');
}
