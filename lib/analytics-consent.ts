export const CONSENT_KEY = 'ph:consent:v1';

export function shouldTrack(input: {
  consent: boolean;
  mainBuild: boolean;
  debug: boolean;
}): boolean {
  if (input.consent) return true;
  if (input.mainBuild) return false;
  return input.debug;
}

function readConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return (
      !!parsed &&
      typeof parsed === 'object' &&
      (parsed as { analytics?: unknown }).analytics === true
    );
  } catch {
    return false;
  }
}

function debugRequested(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('ph_debug_analytics') === '1';
  } catch {
    return false;
  }
}

/** True only when a page is allowed to load the analytics boot. */
export function trackingOpen(): boolean {
  if (typeof window === 'undefined') return false;
  return shouldTrack({
    consent: readConsent(),
    mainBuild: process.env.PH_MAIN_BUILD === '1',
    debug: debugRequested(),
  });
}
