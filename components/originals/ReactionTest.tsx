'use client';

import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { keepBest, readBest, writeBest } from '@/lib/best';
import { track } from '@/lib/analytics';
import { shareOrCopy } from '@/lib/share';

const BEST_KEY = 'ph:reaction-best:v1';

export function ReactionTest() {
  const { showToast } = useToast();
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [message, setMessage] = useState('Press Start, then wait for the colour change.');
  const [score, setScore] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const startTime = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  function wait() {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setPhase('waiting');
    setMessage('Wait for the colour change.');
    setScore(null);
    const delay = Math.floor(Math.random() * 2000) + 1000;
    timeoutRef.current = window.setTimeout(() => {
      setPhase('ready');
      setMessage('Tap');
      startTime.current = Date.now();
    }, delay);
  }

  function handleClick() {
    if (phase === 'idle' || phase === 'result') {
      setBest(readBest(BEST_KEY));
      wait();
      return;
    }
    if (phase === 'waiting') {
      wait();
      setMessage('Too early. Wait for the colour change.');
      return;
    }
    const reaction = Date.now() - startTime.current;
    const next = keepBest(readBest(BEST_KEY), reaction, 'low');
    writeBest(BEST_KEY, next);
    setBest(next);
    setScore(reaction);
    setPhase('result');
    track({ name: 'original_result', slug: 'reaction-time-test', score: reaction });
    setMessage(`${reaction} ms`);
  }

  async function share() {
    if (score == null) return;
    const outcome = await shareOrCopy({
      title: 'Reaction time test',
      text: `My reaction time is ${score} ms on PlayHubPlace.`,
      url: window.location.href,
    });
    if (outcome === 'shared' || outcome === 'copied') {
      track({
        name: 'share',
        slug: 'reaction-time-test',
        method: outcome === 'shared' ? 'native' : 'copy',
      });
    }
    if (outcome === 'copied') showToast('Link copied');
  }

  const tone =
    phase === 'waiting'
      ? 'bg-danger text-night'
      : phase === 'ready'
        ? 'bg-ok text-night'
        : phase === 'result'
          ? 'bg-play text-night'
          : 'bg-raised text-ink';

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        className={`w-full rounded-sheet p-8 text-center ${tone}`}
        style={{ minHeight: '320px' }}
        onPointerDown={(event) => {
          event.preventDefault();
          handleClick();
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          handleClick();
        }}
      >
        <span className="block text-display-sm" aria-live="polite">
          {message}
        </span>
        {phase === 'result' && score != null ? (
          <span className="mt-3 block text-lead">Your reaction time: {score} ms</span>
        ) : null}
      </button>
      {phase === 'result' ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {best != null ? <p className="w-full text-center text-ink-muted">Your best: {best} ms</p> : null}
          <button type="button" className={buttonClass('play')} onClick={handleClick}>
            Try again
          </button>
          <button type="button" className={buttonClass('secondary')} onClick={() => void share()}>
            Share
          </button>
        </div>
      ) : null}
    </div>
  );
}
