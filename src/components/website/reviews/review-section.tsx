'use client';

import { useState } from 'react';
import type { Edition, Product, Review } from '@/lib/storefront-types';
import { ReviewTicker } from '@/components/website/reviews/review-ticker';
import { ReviewCarousel } from '@/components/website/reviews/review-carousel';
import { ReviewFormModal } from '@/components/website/reviews/review-form-modal';
import { ReviewLightbox } from '@/components/website/reviews/review-lightbox';

export function ReviewSection({
  reviews,
  products,
  editions,
}: {
  reviews: Review[];
  products: Product[];
  editions: Edition[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; alt: string | null } | null>(null);

  return (
    <section className="bg-[#080808] text-[#EFECE6]">
      <ReviewTicker />

      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 pt-14 sm:pt-20 pb-20 sm:pb-28">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 mb-10 sm:mb-14">
          <div>
            <p className="eyebrow mb-4 text-[#777777]">The Community</p>
            <h2 className="font-display text-[42px] leading-[0.95] sm:text-[64px] lg:text-[76px] tracking-[-0.03em] text-[#EFECE6]">
              What the Culture Says.
            </h2>
            <p className="mt-6 font-mono-meta text-[11px] sm:text-[12px] text-[#777777] tracking-[0.18em]">
              Real People. Real Jerseys. Real Feedback.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center h-[50px] px-8 rounded-full bg-[#EFECE6] text-[#080808] text-[13px] font-medium uppercase tracking-[0.05em] hover:bg-[#B3001B] hover:text-[#EFECE6] transition-colors duration-200 shrink-0"
          >
            Write a Review
          </button>
        </div>

        {reviews.length > 0 ? (
          <ReviewCarousel reviews={reviews} onPhotoClick={(url, alt) => setLightbox({ url, alt })} />
        ) : (
          <div className="text-center py-16 border border-white/10 rounded-[6px]">
            <p className="font-display text-3xl sm:text-4xl text-[#EFECE6]">
              The Culture Is Still Talking.
            </p>
            <p className="mt-3 text-[15px] text-[#777777]">
              Be the first to leave a review.
            </p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-8 inline-flex items-center justify-center h-[50px] px-8 rounded-full bg-[#EFECE6] text-[#080808] text-[13px] font-medium uppercase tracking-[0.05em] hover:bg-[#B3001B] hover:text-[#EFECE6] transition-colors duration-200"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>

      <ReviewFormModal open={formOpen} onClose={() => setFormOpen(false)} products={products} editions={editions} />
      <ReviewLightbox
        photoUrl={lightbox?.url ?? null}
        photoAlt={lightbox?.alt ?? null}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
}