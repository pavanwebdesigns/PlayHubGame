'use client';

import { useEffect, useId, useRef, type InputHTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { isSearchShortcutBlocked } from '@/lib/search-shortcut';

type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value: string;
  onValueChange: (value: string) => void;
  status?: string;
};

function describe(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return {
    tagName: target.tagName,
    isContentEditable:
      target instanceof HTMLElement && target.isContentEditable,
    inGameFrame: Boolean(target.closest('[data-game-frame]')),
  };
}

export function SearchField({
  value,
  onValueChange,
  status = '',
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (event.defaultPrevented) return;
      const input = inputRef.current;
      if (!input || input.offsetParent === null) return;
      if (
        isSearchShortcutBlocked(describe(event.target)) ||
        isSearchShortcutBlocked(describe(document.activeElement))
      ) {
        return;
      }
      event.preventDefault();
      input.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative flex min-h-tap items-center rounded-input border border-edge bg-night">
      <label className="sr-only" htmlFor={inputId}>
        Search games
      </label>
      <input
        {...props}
        ref={inputRef}
        id={inputId}
        value={value}
        placeholder="Search games"
        onChange={(event) => onValueChange(event.target.value)}
        className="min-h-tap w-full bg-transparent px-3 text-ink outline-none placeholder:text-ink-muted"
      />
      <kbd
        className="mr-2 hidden text-ui text-ink-muted lg:inline"
        aria-hidden="true"
      >
        /
      </kbd>
      {value.length > 0 ? (
        <button
          type="button"
          className="press mr-1 inline-flex h-tap w-tap items-center justify-center text-ink"
          aria-label="Clear search"
          onClick={() => {
            onValueChange('');
            inputRef.current?.focus();
          }}
        >
          <X aria-hidden="true" size={20} />
        </button>
      ) : null}
      <div aria-live="polite" className="sr-only">
        {status}
      </div>
    </div>
  );
}
