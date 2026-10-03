import { absoluteFileUrl, absoluteUrl } from '@/lib/seo';

export function organizationLd() {
  return {
    '@type': 'Organization',
    name: 'PlayHubPlace',
    url: absoluteUrl('/'),
    logo: absoluteFileUrl('/logo.png'),
  };
}

export function websiteLd() {
  return {
    '@type': 'WebSite',
    name: 'PlayHubPlace',
    url: absoluteUrl('/'),
  };
}

export function breadcrumbLd(crumbs: readonly { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqLd(items: readonly { question: string; answer: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function collectionLd(input: {
  name: string;
  path: string;
  games: readonly { slug: string; title: string }[];
}) {
  return {
    '@type': 'CollectionPage',
    name: input.name,
    url: absoluteUrl(input.path),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.games.slice(0, 24).map((game, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/game/${game.slug}/`),
        name: game.title,
      })),
    },
  };
}
