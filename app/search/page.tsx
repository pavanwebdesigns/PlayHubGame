import { SearchBox } from '@/components/search/SearchBox';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Search',
  description: 'Search free browser games on PlayHubPlace.',
  path: '/search/',
  index: false,
});

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl text-ink">Search</h1>
      <SearchBox initialQuery="" />
    </main>
  );
}
