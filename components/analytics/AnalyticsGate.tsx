'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { CONSENT_KEY, trackingOpen } from '@/lib/analytics-consent';

/** Loads the analytics boot only after consent. Renders nothing before that. */
export function AnalyticsGate() {
  const [Boot, setBoot] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    function load() {
      if (!trackingOpen()) return;
      void import('@/components/analytics/AnalyticsBoot').then((mod) => {
        if (!cancelled) setBoot(() => mod.AnalyticsBoot);
      });
    }
    load();
    function onStorage(event: StorageEvent) {
      if (event.key === CONSENT_KEY) load();
    }
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return Boot ? <Boot /> : null;
}
