import { ContentBlocks } from '@/components/content/ContentBlocks';
import type { ContentDoc } from '@/lib/content';

export function ReadMore({ doc }: { doc: ContentDoc }) {
  const [lead, ...rest] = doc.blocks;
  if (!lead) return null;
  if (rest.length === 0) return <ContentBlocks blocks={[lead]} />;

  return (
    <details className="intro-more">
      <summary>
        <span className="intro-more-closed">Read more</span>
        <span className="intro-more-open">Show less</span>
      </summary>
      <ContentBlocks blocks={[lead]} />
      <div className="intro-rest">
        <ContentBlocks blocks={rest} />
      </div>
    </details>
  );
}
