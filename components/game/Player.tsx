'use client';

import { useSiteIcons } from '@/components/icons/IconProvider';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ActionBar } from '@/components/game/ActionBar';
import { CoverImage } from '@/components/game/CoverImage';
import { Button } from '@/components/ui/Button';
import { playDevice, track } from '@/lib/analytics';
import { tipAt } from '@/config/loading-tips';
import { PLAYER_SIZES, SPOTLIGHT_WIDTHS } from '@/lib/cover-sizes';
import type { StoredFavorite } from '@/lib/favorites';
import { rememberRecent } from '@/lib/recent';
import { nextPhase, wantsImmersive, type PlayerPhase } from '@/lib/player';

export type PlayGame = {
  slug: string;
  title: string;
  cover: string;
  coverWidth: number | null;
  embedUrl: string;
  orientation: 'landscape' | 'portrait' | 'all';
  aspect: number;
  hub: string;
};

const LOAD_MS = 15_000;

function nextTip(): number {
  try {
    const current = Number(sessionStorage.getItem('ph:tip:v1') ?? '0');
    const index = Number.isFinite(current) ? current : 0;
    sessionStorage.setItem('ph:tip:v1', String(index + 1));
    return index;
  } catch {
    return 0;
  }
}

function blockPageScroll(event: KeyboardEvent, frame: HTMLElement | null): void {
  if (!frame) return;
  const active = document.activeElement;
  if (!active || (active !== frame && !frame.contains(active))) return;
  if (active instanceof HTMLElement && active.closest('button, a, input, textarea')) {
    return;
  }
  if (
    event.key === ' ' ||
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight'
  ) {
    event.preventDefault();
  }
}

export function Player({
  game,
  favorite,
  upNextHref,
  theatre,
  onTheatre,
}: {
  game: PlayGame;
  favorite: StoredFavorite;
  upNextHref: string;
  theatre: boolean;
  onTheatre: () => void;
}) {
  const icons = useSiteIcons();
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pushed = useRef(false);
  const immersiveRef = useRef(false);
  const exitRef = useRef<() => void>(() => {});
  const fullRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<PlayerPhase>('cover');
  const [attempt, setAttempt] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const [exitSolid, setExitSolid] = useState(false);
  const [tip, setTip] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const startedAt = useRef(0);
  const immersiveAt = useRef(0);
  const rotateSent = useRef(false);

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = window.setTimeout(
      () =>
        setPhase((current) => {
          const next = nextPhase(current, 'timeout');
          if (current === 'loading' && next === 'error') {
            track({ name: 'game_load_failed', slug: game.slug });
          }
          return next;
        }),
      LOAD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase, attempt, game.slug]);

  useEffect(() => {
    if (phase !== 'playing') return;
    rememberRecent(game.slug);
    iframeRef.current?.focus();
  }, [phase, game.slug, attempt]);

  useEffect(() => {
    function onPop() {
      pushed.current = false;
      setImmersive(false);
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {});
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(orientation: portrait)');
    const update = () => setPortrait(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = shellRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    void node.requestFullscreen?.().catch(() => {});
  }, []);

  function enterImmersive() {
    if (!pushed.current) {
      history.pushState({ phImmersive: 1 }, '');
      pushed.current = true;
    }
    setImmersive(true);
    immersiveAt.current = performance.now();
    track({ name: 'immersive_enter', slug: game.slug });
    void shellRef.current?.requestFullscreen?.().catch(() => {});
    if (game.orientation !== 'landscape') return;
    try {
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (value: string) => Promise<void>;
      };
      void orientation.lock?.('landscape')?.catch(() => {});
    } catch {
      // iPhone Safari has no orientation lock.
    }
  }

  const exitImmersive = useCallback(() => {
    if (immersiveRef.current) {
      const seconds = immersiveAt.current
        ? Math.round((performance.now() - immersiveAt.current) / 1000)
        : 0;
      track({ name: 'immersive_exit', slug: game.slug, seconds_in_game: seconds });
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
    setImmersive(false);
    if (!pushed.current) return;
    pushed.current = false;
    history.back();
  }, [game.slug]);

  useEffect(() => {
    immersiveRef.current = immersive;
    exitRef.current = exitImmersive;
    fullRef.current = toggleFullscreen;
  }, [immersive, exitImmersive, toggleFullscreen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');
      if (
        !typing &&
        (event.key === 'f' || event.key === 'F') &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        fullRef.current();
      }
      if (event.key === 'Escape' && immersiveRef.current) exitRef.current();
      blockPageScroll(event, frameRef.current);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function play() {
    startedAt.current = performance.now();
    rotateSent.current = false;
    track({
      name: 'game_play_start',
      slug: game.slug,
      hub: game.hub,
      orientation: game.orientation,
      device: playDevice(),
    });
    setTip(nextTip());
    setPhase((current) => nextPhase(current, 'play'));
    if (wantsImmersive(window.innerWidth, navigator.maxTouchPoints)) {
      enterImmersive();
    }
  }

  function reload() {
    setAttempt((value) => value + 1);
    setPhase('loading');
  }

  const showCover = phase === 'cover' || phase === 'loading';
  const showFrame = phase === 'loading' || phase === 'playing';
  const showRotate = immersive && game.orientation === 'landscape' && portrait;

  useEffect(() => {
    if (!showRotate || rotateSent.current) return;
    rotateSent.current = true;
    track({ name: 'rotate_prompt_shown', slug: game.slug });
  }, [showRotate, game.slug]);

  return (
    <div>
      <div
        ref={shellRef}
        className={immersive ? 'player-immersive' : undefined}
        data-immersive={immersive ? 'true' : 'false'}
      >
        {immersive ? (
          <button
            type="button"
            className="player-exit"
            data-solid={exitSolid ? 'true' : 'false'}
            onPointerDown={() => setExitSolid(true)}
            onClick={exitImmersive}
          >
            Exit
          </button>
        ) : null}
        <div
          ref={frameRef}
          data-game-frame
          className="player-stage"
          style={{ '--game-aspect': String(game.aspect) } as CSSProperties}
        >
          {showFrame ? (
            <iframe
              key={attempt}
              ref={iframeRef}
              title={`${game.title} game`}
              src={game.embedUrl}
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
              className="absolute inset-0 h-full w-full border-0"
              onLoad={() =>
                setPhase((current) => {
                  const next = nextPhase(current, 'loaded');
                  if (current === 'loading' && next === 'playing' && startedAt.current) {
                    track({
                      name: 'game_load_time',
                      slug: game.slug,
                      ms: Math.round(performance.now() - startedAt.current),
                    });
                  }
                  return next;
                })
              }
            />
          ) : null}
          {showCover ? (
            <div className={`player-cover${phase === 'loading' ? ' is-blurred' : ''}`}>
              <CoverImage
                src={game.cover}
                alt=""
                title={game.title}
                coverWidth={game.coverWidth}
                sizes={PLAYER_SIZES}
                widths={SPOTLIGHT_WIDTHS}
                priority
              />
            </div>
          ) : null}
          {phase === 'cover' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="lg" onClick={play}>
                Play
              </Button>
            </div>
          ) : null}
          {phase === 'loading' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              <span className="spinner text-play" aria-hidden="true" />
              <p className="max-w-xs text-ink" aria-live="polite">
                {tipAt(tip)}
              </p>
            </div>
          ) : null}
          {phase === 'error' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-deck p-4 text-center">
              <p className="max-w-sm text-ink">
                This game didn’t load. Turn off your ad blocker for this site, then reload.
              </p>
              <Button onClick={reload}>Reload</Button>
              <a href={upNextHref} className="inline-flex min-h-tap items-center text-play">
                Pick another game
              </a>
            </div>
          ) : null}
        </div>
        {showRotate ? (
          <div className="player-rotate">
            <span className="inline-flex rotate-90">{icons.phone}</span>
            <p className="text-lead text-ink">Turn your phone sideways to play</p>
          </div>
        ) : null}
      </div>
      {immersive ? null : (
        <p className="mt-2 text-ink-muted">Plays in your browser — no download</p>
      )}
      {immersive ? null : (
        <ActionBar
          favorite={favorite}
          title={game.title}
          path={`/game/${game.slug}/`}
          theatre={theatre}
          onTheatre={onTheatre}
          onFullscreen={toggleFullscreen}
        />
      )}
    </div>
  );
}
