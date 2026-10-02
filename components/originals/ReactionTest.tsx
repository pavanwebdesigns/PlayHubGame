'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function ReactionTest() {
  const [gameState, setGameState] = useState<
    'idle' | 'waiting' | 'ready' | 'finished'
  >('idle');
  const [message, setMessage] = useState('Click to start');
  const [score, setScore] = useState<number | null>(null);
  const startTime = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  function handleClick() {
    if (gameState === 'idle' || gameState === 'finished') {
      setGameState('waiting');
      setMessage('Wait for green...');
      setScore(null);
      const delay = Math.floor(Math.random() * 2000) + 1000;
      timeoutRef.current = window.setTimeout(() => {
        setGameState('ready');
        setMessage('Click now');
        startTime.current = Date.now();
      }, delay);
      return;
    }
    if (gameState === 'waiting') {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setGameState('finished');
      setMessage('Too early');
      return;
    }
    const reactionTime = Date.now() - startTime.current;
    setScore(reactionTime);
    setGameState('finished');
    setMessage(`${reactionTime} ms`);
  }

  const tone =
    gameState === 'waiting'
      ? 'bg-danger text-night'
      : gameState === 'ready'
        ? 'bg-ok text-night'
        : gameState === 'finished'
          ? 'bg-play text-night'
          : 'bg-raised text-ink';

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-11 items-center text-play"
      >
        Back to games
      </Link>
      <h1 className="mb-4 text-3xl text-ink">Reaction Time Test</h1>
      <button
        type="button"
        className={`w-full rounded-sheet p-8 text-center ${tone}`}
        style={{ minHeight: '320px' }}
        onMouseDown={handleClick}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          handleClick();
        }}
      >
        <span className="block text-4xl" aria-live="polite">
          {message}
        </span>
        {gameState === 'finished' && score != null ? (
          <span className="mt-3 block text-xl">
            Your reaction time: {score} ms
          </span>
        ) : null}
        {gameState === 'idle' ? (
          <span className="mt-3 block text-lg">Click this box to begin</span>
        ) : null}
      </button>
    </div>
  );
}
