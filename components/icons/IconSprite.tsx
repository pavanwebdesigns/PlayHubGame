import { createElement } from 'react';
import { ICON_NAMES, NODES } from '@/components/icons/glyphs';

const paint = {
  fill: 'inherit',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function draw(parts: readonly (readonly [string, Record<string, string>])[]) {
  return parts.map(([tag, attrs], index) =>
    createElement(tag, { key: index, ...attrs, ...paint }),
  );
}

const CHEVRONS = {
  'chevrons-left': [
    ['path', { d: 'm11 17-5-5 5-5' }],
    ['path', { d: 'm18 17-5-5 5-5' }],
  ],
  'chevrons-right': [
    ['path', { d: 'm6 17 5-5-5-5' }],
    ['path', { d: 'm13 17 5-5-5-5' }],
  ],
} as const;

/** Every icon path, once, for `<use href="#i-…">`. */
export function IconSprite() {
  return (
    <svg className="icon-sprite" aria-hidden="true">
      {ICON_NAMES.map((name) => (
        <symbol key={name} id={`i-${name}`} viewBox="0 0 24 24">
          {draw(NODES[name])}
        </symbol>
      ))}
      {(Object.keys(CHEVRONS) as (keyof typeof CHEVRONS)[]).map((name) => (
        <symbol key={name} id={`i-${name}`} viewBox="0 0 24 24">
          {draw(CHEVRONS[name])}
        </symbol>
      ))}
    </svg>
  );
}
