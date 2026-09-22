import type { Review } from '@/lib/review-types';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width="21"
          height="21"
          aria-hidden="true"
          className={i <= rating ? 'text-red fill-red' : 'text-black/15 fill-black/15'}
        >
          <path d="M12 2l2.9 6.26 6.9.68-5.23 4.55 1.54 6.75L12 16.9 5.89 20.24l1.54-6.75L2.2 8.94l6.9-.68L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewCard({
  review,
  onPhotoClick,
}: {
  review: Review;
  onPhotoClick?: (photoUrl: string, photoAlt: string | null) => void;
}) {
  const date = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
    .format(new Date(review.createdAt))
    .toUpperCase();

  return (
    <article className="review-card">
      {review.photoUrl && (
        <button
          type="button"
          onClick={() => onPhotoClick?.(review.photoUrl!, review.photoAlt)}
          className="block w-full max-w-[110px] h-[110px] overflow-hidden rounded-[4px] mb-5"
        >
          <img
            src={review.photoUrl}
            alt={review.photoAlt ?? `${review.customerName}'s photo`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </button>
      )}

      <header className="flex items-center justify-between gap-3">
        <span className="text-[16px] font-medium text-black">{review.customerName}</span>
        <span className="flex items-center gap-2 shrink-0 text-[14px]">
          {review.verifiedBuyer && (
            <span className="flex items-center gap-1.5 text-chrome">
              <svg
                viewBox="0 0 20 20"
                width="15"
                height="15"
                aria-hidden="true"
                className="text-chrome shrink-0"
              >
                <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.2 10.4l2.4 2.4 5-5.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Verified Buyer
            </span>
          )}
          <span className="font-mono-meta text-[11px] text-chrome">{date}</span>
        </span>
      </header>

      <div className="mt-4 mb-5">
        <Stars rating={review.rating} />
      </div>

      <h3 className="text-[24px] leading-[1.12] font-medium text-black mb-3">
        {review.title || 'Review'}
      </h3>
      <p className="text-[15.5px] leading-[1.5] text-[#232323] max-w-[380px]">{review.body}</p>

      <footer className="mt-6 pt-5 border-t border-black/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[4px] overflow-hidden bg-charcoal flex-shrink-0" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&q=60"
            alt=""
            className="w-full h-full object-cover opacity-70"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-black truncate">{review.productName}</p>
          <p className="font-mono-meta text-[10.5px] text-chrome">{review.productVariant.toUpperCase()}</p>
        </div>
      </footer>
    </article>
  );
}