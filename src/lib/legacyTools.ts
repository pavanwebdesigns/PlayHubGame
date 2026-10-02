export const WORKUTILITIES_HOME = 'https://workutilities.com/';

export type QuickGamePage = 'reaction-test' | 'cps-test';

/** Where an old tools URL should go. Other pages return null. */
export function legacyToolTarget(page: string | null): QuickGamePage | typeof WORKUTILITIES_HOME | null {
  if (page === 'tool-reaction') return 'reaction-test';
  if (page === 'tool-cps') return 'cps-test';
  if (page === 'tools' || (page != null && page.startsWith('tool-'))) return WORKUTILITIES_HOME;
  return null;
}

/** Rewrite the current query, or leave the site. Returns whether the URL changed. */
export function applyLegacyToolRedirect(): 'external' | 'replaced' | null {
  const page = new URLSearchParams(window.location.search).get('page');
  const target = legacyToolTarget(page);
  if (target == null) return null;
  if (target === WORKUTILITIES_HOME) {
    window.location.replace(WORKUTILITIES_HOME);
    return 'external';
  }
  const url = new URL(window.location.href);
  url.searchParams.set('page', target);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  return 'replaced';
}

export function pageFromLocation(): string {
  const page = new URLSearchParams(window.location.search).get('page') || 'home';
  const target = legacyToolTarget(page);
  if (target == null) return page;
  if (target === WORKUTILITIES_HOME) return 'home';
  return target;
}
