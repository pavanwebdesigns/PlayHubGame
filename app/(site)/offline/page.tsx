import { OfflineRecent } from '@/components/offline/OfflineRecent';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Offline',
  description: 'PlayHub Originals are saved on this device.',
  path: '/offline/',
  index: false,
});

const ORIGINALS = [
  { href: '/originals/cps-test/', label: 'CPS test' },
  { href: '/originals/reaction-time-test/', label: 'Reaction time test' },
] as const;

export default function OfflinePage() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-6">
      <h1 className="text-title text-ink">{"You're offline"}</h1>
      <p className="text-ink">{"You're offline. These games are saved on this device:"}</p>
      <section>
        <h2 className="mb-2 text-title text-ink">PlayHub Originals</h2>
        <ul className="grid gap-2">
          {ORIGINALS.map((game) => (
            <li key={game.href}>
              <a href={game.href} className="inline-flex min-h-tap items-center text-play">
                {game.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-title text-ink">Recently played</h2>
        <OfflineRecent />
      </section>
    </main>
  );
}
