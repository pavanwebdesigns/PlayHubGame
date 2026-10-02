import { Gamepad2 } from 'lucide-react';
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/config/site';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display flex items-center gap-3 text-4xl text-ink">
        <Gamepad2 aria-hidden="true" className="text-play" size={32} />
        {SITE_NAME}
      </h1>
      <p className="mt-4 text-ink-muted">{DEFAULT_DESCRIPTION}</p>
    </main>
  );
}
