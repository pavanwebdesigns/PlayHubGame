'use client';

import { useRef, useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { keepBest, readBest, writeBest } from '@/lib/best';
import { shareOrCopy } from '@/lib/share';

const BEST_KEY = 'ph:cps-best:v1';
const CHOICES = [5, 10] as const;

export function CpsTest() {
  const { showToast } = useToast();
  const [seconds, setSeconds] = useState<(typeof CHOICES)[number]>(5);
  const [clicks, setClicks] = useState(0);
  const [left, setLeft] = useState(5);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const clicksRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  function stop() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function start() {
    stop();
    clicksRef.current = 0;
    setClicks(0);
    setLeft(seconds);
    setResult(null);
    setRunning(true);
    setBest(readBest(BEST_KEY));
    timerRef.current = window.setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          stop();
          setRunning(false);
          const cps = clicksRef.current / seconds;
          setResult(cps);
          const next = keepBest(readBest(BEST_KEY), cps, 'high');
          writeBest(BEST_KEY, next);
          setBest(next);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function tap() {
    if (!running) return;
    clicksRef.current += 1;
    setClicks(clicksRef.current);
  }

  async function share() {
    if (result == null) return;
    const text = `I scored ${result.toFixed(1)} clicks per second on the PlayHubPlace CPS test.`;
    const outcome = await shareOrCopy({
      title: 'CPS test',
      text,
      url: window.location.href,
    });
    if (outcome === 'copied') showToast('Link copied');
  }

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 flex justify-center gap-2" role="group" aria-label="Time">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            className={buttonClass(seconds === choice ? 'play' : 'secondary')}
            aria-pressed={seconds === choice}
            disabled={running}
            onClick={() => setSeconds(choice)}
          >
            {choice} seconds
          </button>
        ))}
      </div>
      {result == null ? (
        <button
          type="button"
          className="mx-auto my-4 flex h-52 w-52 items-center justify-center rounded-full border border-edge text-3xl text-ink"
          onPointerDown={(event) => {
          event.preventDefault();
          if (running) tap();
          else start();
        }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            if (running) tap();
            else start();
          }}
        >
          {running ? 'Tap' : 'Start'}
        </button>
      ) : (
        <div className="my-6">
          <p className="text-display text-ink" role="status">
            {result.toFixed(1)} clicks per second
          </p>
          {best != null ? (
            <p className="mt-2 text-ink-muted">Your best: {best.toFixed(1)}</p>
          ) : null}
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" className={buttonClass('play')} onClick={start}>
              Try again
            </button>
            <button type="button" className={buttonClass('secondary')} onClick={() => void share()}>
              Share
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-center gap-10 text-ink">
        <div>
          <div className="text-display-sm">{clicks}</div>
          <div className="text-ink-muted">Clicks</div>
        </div>
        <div>
          <div className="text-display-sm">{left}s</div>
          <div className="text-ink-muted">Time left</div>
        </div>
      </div>
    </div>
  );
}
