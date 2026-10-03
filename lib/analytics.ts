import { GA4_MEASUREMENT_ID } from '@/config/site';

export const CONSENT_KEY = 'ph:consent:v1';

export type AnalyticsEvent =
  | { name: 'tile_click'; slug: string; source: string; position: number }
  | { name: 'game_play_start'; slug: string; hub: string; orientation: string; device: string }
  | { name: 'game_load_time'; slug: string; ms: number }
  | { name: 'game_load_failed'; slug: string }
  | { name: 'immersive_enter'; slug: string }
  | { name: 'immersive_exit'; slug: string; seconds_in_game: number }
  | { name: 'rotate_prompt_shown'; slug: string }
  | { name: 'favorite_add'; slug: string }
  | { name: 'favorite_remove'; slug: string }
  | { name: 'share'; slug: string; method: string }
  | { name: 'search'; term: string; results: number }
  | { name: 'search_no_results'; term: string; results: number }
  | { name: 'report_problem'; slug: string; reason: string }
  | { name: 'original_result'; slug: string; score: number }
  | { name: 'web_vital'; metric_name: string; value: number; page_type: string };

export type AnalyticsParams = Record<string, string | number>;

type Gtag = (command: 'event' | 'js' | 'config', ...args: unknown[]) => void;

export function shouldTrack(input: {
  consent: boolean;
  mainBuild: boolean;
  debug: boolean;
}): boolean {
  if (input.consent) return true;
  if (input.mainBuild) return false;
  return input.debug;
}

export function measurementIdReady(id: string = GA4_MEASUREMENT_ID): boolean {
  return id.length > 0 && !id.startsWith('TODO');
}

export function eventParams(event: AnalyticsEvent): AnalyticsParams {
  const params: AnalyticsParams = {};
  for (const [key, value] of Object.entries(event)) {
    if (key === 'name') continue;
    if (typeof value === 'string' || typeof value === 'number') params[key] = value;
  }
  return params;
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

export function trackingOpen(): boolean {
  if (typeof window === 'undefined') return false;
  return shouldTrack({
    consent: readConsent(),
    mainBuild: process.env.PH_MAIN_BUILD === '1',
    debug: debugRequested(),
  });
}

function windowGtag(): Gtag | null {
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  return typeof gtag === 'function' ? gtag : null;
}

let scriptStarted = false;

function ensureTransport(): void {
  if (!measurementIdReady() || scriptStarted || typeof document === 'undefined') return;
  scriptStarted = true;
  const id = GA4_MEASUREMENT_ID;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.ga4 = id;
  document.head.appendChild(script);
  const dataLayer = ((window as Window & { dataLayer?: unknown[] }).dataLayer ??= []);
  const gtag: Gtag = (...args) => {
    dataLayer.push(args);
  };
  (window as Window & { gtag?: Gtag }).gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
}

export function track(event: AnalyticsEvent): void {
  if (!trackingOpen()) return;
  ensureTransport();
  windowGtag()?.('event', event.name, eventParams(event));
}

export function pageType(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home';
  const segment = pathname.split('/').filter(Boolean)[0] ?? 'other';
  if (segment === 'game') return 'game';
  if (segment === 'category') return 'category';
  if (segment === 'originals') return 'original';
  if (segment === 'collection') return 'collection';
  if (segment === 'search') return 'search';
  return 'other';
}

export function playDevice(): 'touch' | 'desktop' {
  if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) return 'touch';
  return 'desktop';
}
