'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

export function CpsTest() {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [result, setResult] = useState<number | null>(null);
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
    setTimeLeft(5);
    setResult(null);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stop();
          setResult(clicksRef.current / 5);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleClick() {
    if (timeLeft === 0) {
      start();
      return;
    }
    if (timerRef.current == null) start();
    clicksRef.current += 1;
    setClicks(clicksRef.current);
  }

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-left">
        <Link
          href="/"
          className="mb-4 inline-flex min-h-11 items-center text-play"
        >
          Back to games
        </Link>
      </div>
      <h1 className="mb-4 text-3xl text-ink">CPS Test</h1>
      <p className="text-ink-muted">
        Click as many times as you can in 5 seconds.
      </p>
      <button
        type="button"
        className="mx-auto my-4 flex h-52 w-52 items-center justify-center rounded-full border border-edge text-3xl text-ink"
        onMouseDown={handleClick}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          handleClick();
        }}
      >
        {timeLeft === 0 ? 'Retry' : 'Click'}
      </button>
      <div className="flex justify-center gap-10 text-ink">
        <div>
          <div className="text-4xl">{clicks}</div>
          <div className="text-ink-muted">Clicks</div>
        </div>
        <div>
          <div className="text-4xl">{timeLeft}s</div>
          <div className="text-ink-muted">Time left</div>
        </div>
      </div>
      {result != null ? (
        <p className="mt-4 text-xl text-ink" role="status">
          Your speed: <strong>{result} CPS</strong>
        </p>
      ) : null}
    </div>
  );
}
