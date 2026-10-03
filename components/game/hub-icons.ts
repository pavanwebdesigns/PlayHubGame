import type { IconName } from '@/components/icons/glyphs';
import type { CollectionSlug } from '@/config/collections';
import type { HubSlug } from '@/config/taxonomy';

export const HUB_ICONS: Record<HubSlug, IconName> = {
  action: 'swords',
  adventure: 'compass',
  arcade: 'joystick',
  puzzle: 'puzzle',
  'brain-memory': 'brain',
  'match-3': 'gem',
  casual: 'smile',
  shooting: 'crosshair',
  'racing-driving': 'car',
  sports: 'trophy',
  strategy: 'castle',
  'board-card': 'spade',
  'two-player': 'users',
  'girls-dress-up': 'shirt',
  'coloring-drawing': 'palette',
  'simulation-idle': 'timer',
  platformer: 'person-standing',
  'skill-hyper-casual': 'zap',
  'math-word': 'hash',
  seasonal: 'snowflake',
};

export const COLLECTION_ICONS: Record<CollectionSlug, IconName> = {
  'one-thumb': 'smartphone',
  'two-players': 'users',
  'train-your-brain': 'brain',
  'just-relax': 'coffee',
  'five-minute': 'timer',
  'new-this-week': 'sparkles',
};
