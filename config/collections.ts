import type { GameRecord } from '@/lib/catalog/types';

type CollectionMatch = (game: GameRecord, now: Date) => boolean;

export type CollectionSlug =
  | 'one-thumb'
  | 'two-players'
  | 'train-your-brain'
  | 'just-relax'
  | 'five-minute'
  | 'new-this-week';

export const COLLECTIONS: readonly {
  slug: CollectionSlug;
  name: string;
  matches: CollectionMatch;
}[] = [
  {
    slug: 'one-thumb',
    name: 'One-thumb games',
    matches: (game) =>
      game.orientation === 'portrait' || game.orientation === 'all',
  },
  {
    slug: 'two-players',
    name: 'Two players, one screen',
    matches: (game) => game.rawCategory === 'two-player',
  },
  {
    slug: 'train-your-brain',
    name: 'Train your brain',
    matches: (game) =>
      ['brain', 'memory', 'math', 'trivia', 'word', 'jigsaw-puzzles'].includes(
        game.rawCategory,
      ),
  },
  {
    slug: 'just-relax',
    name: 'Just relax',
    matches: (game) =>
      [
        'coloring',
        'drawing',
        'jigsaw-puzzles',
        'mahjong',
        'solitaire',
        'match-3',
      ].includes(game.rawCategory),
  },
  {
    slug: 'five-minute',
    name: '5-minute games',
    matches: (game) =>
      ['hyper-casual', 'tap', 'clicker', 'runner'].includes(game.rawCategory),
  },
  {
    slug: 'new-this-week',
    name: 'New this week',
    matches: (game, now) => {
      const published = Date.parse(game.publishedAt);
      if (Number.isNaN(published)) return false;
      const age = now.getTime() - published;
      const week = 7 * 24 * 60 * 60 * 1000;
      return age >= 0 && age <= week;
    },
  },
];
