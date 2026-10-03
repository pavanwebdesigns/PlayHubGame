import {
  listingPath,
  type ListingQuery,
  type ListingSort,
} from '@/lib/listing';
import { collectionTitle, hubTitle, pagedTitle } from '@/lib/seo';

export function listingMeta(input: {
  name: string;
  summary: string;
  query: ListingQuery;
  pages: number;
  base: string;
  defaultSort: ListingSort;
  indexable: boolean;
  kind: 'hub' | 'collection' | 'new';
}): {
  title: string;
  description: string;
  path: string;
  index: boolean;
} {
  const self = listingPath(input.base, input.query, input.defaultSort);
  const first = listingPath(
    input.base,
    { sort: input.defaultSort, page: 1 },
    input.defaultSort,
  );
  const tagged = Boolean(input.query.tag);
  const sorted = !tagged && input.query.sort !== input.defaultSort;
  const paged = !tagged && !sorted && input.query.page > 1;
  const index = tagged ? false : input.indexable;
  const path = sorted && index ? first : self;
  const title = paged
    ? pagedTitle(input.name, input.query.page)
    : input.kind === 'collection'
      ? collectionTitle(input.name)
      : hubTitle(input.name);
  const description = paged
    ? `${input.summary} Page ${input.query.page} of ${input.pages}.`
    : input.summary;
  return { title, description, path, index };
}
