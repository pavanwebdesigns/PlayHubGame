export type ShortcutTarget = {
  tagName?: string;
  isContentEditable?: boolean;
  inGameFrame?: boolean;
};

/** True when "/" should leave the current control alone. */
export function isSearchShortcutBlocked(
  target: ShortcutTarget | null,
): boolean {
  if (!target) return false;
  if (target.isContentEditable || target.inGameFrame) return true;
  const tag = target.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}
