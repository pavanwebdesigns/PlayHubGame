import { isSearchShortcutBlocked } from '@/lib/search-shortcut';

function describe(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return {
    tagName: target.tagName,
    isContentEditable: target instanceof HTMLElement && target.isContentEditable,
    inGameFrame: Boolean(target.closest('[data-game-frame]')),
  };
}

/** Focus the top-bar search field when someone presses "/". */
export function bindSearchShortcut(): () => void {
  function onKey(event: KeyboardEvent) {
    if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.defaultPrevented) return;
    const input = document.querySelector<HTMLInputElement>('[data-top-search]');
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
}
