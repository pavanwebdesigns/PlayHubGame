import { ContentBlocks } from '@/components/content/ContentBlocks';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqItems, type ContentDoc } from '@/lib/content';
import { absoluteUrl } from '@/lib/seo';

export function AboutHome({ doc }: { doc: ContentDoc }) {
  const faqs = faqItems(doc);
  const faqAt = doc.blocks.findIndex(
    (block) => block.type === 'h2' && block.text.toLowerCase() === 'faq',
  );
  const intro = faqAt === -1 ? doc.blocks : doc.blocks.slice(0, faqAt);

  return (
    <section>
      <h2 className="text-title text-ink">{doc.title}</h2>
      <ContentBlocks blocks={intro} />
      {faqs.length > 0 ? (
        <div className="prose-ph">
          <h2>FAQ</h2>
          {faqs.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      ) : null}
      {faqs.length > 0 ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }}
        />
      ) : null}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'PlayHubPlace',
          url: absoluteUrl('/'),
          potentialAction: {
            '@type': 'SearchAction',
            target: `${absoluteUrl('/search/')}?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
    </section>
  );
}
