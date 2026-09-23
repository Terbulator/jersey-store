import Link from 'next/link';
import type { PageBlocks } from '@/lib/pages';

// Shared static-page renderer: the public /<slug> page and the admin page
// preview render the same blocks through this component.

const HEADING: Record<string, string> = {
  sm: 'th-h3',
  md: 'th-h2',
  lg: 'th-h1',
};

export function StaticBlocks({ blocks }: { blocks: PageBlocks }) {
  return (
    <div className="space-y-8">
      {(blocks ?? []).map((b) => {
        if (b.type === 'heading') {
          return (
            <h2 key={b.id} className={`${HEADING[b.size ?? 'md']} text-off-white`}>
              {b.text}
            </h2>
          );
        }
        if (b.type === 'text') {
          return (
            <p key={b.id} className="th-body whitespace-pre-line text-off-white/70">
              {b.text}
            </p>
          );
        }
        if (b.type === 'image' && b.url) {
          return (
            <figure key={b.id}>
              <img src={b.url} alt={b.alt ?? ''} className="w-full rounded-xl" loading="lazy" />
              {!!b.caption && (
                <figcaption className="mt-2 text-center font-mono-meta text-[10px] text-off-white/40">
                  {b.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        if (b.type === 'button' && b.text) {
          return (
            <div key={b.id}>
              <Link href={b.destination || '/shop'} className="btn-pill btn-pill-solid">
                {b.text}
              </Link>
            </div>
          );
        }
        if (b.type === 'divider') {
          return <div key={b.id} className="divider" />;
        }
        return null;
      })}
    </div>
  );
}
