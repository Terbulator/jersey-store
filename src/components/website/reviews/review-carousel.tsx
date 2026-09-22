'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Review } from '@/lib/review-types';
import { ReviewCard } from '@/components/website/reviews/review-card';

export function ReviewCarousel({
  reviews,
  onPhotoClick,
}: {
  reviews: Review[];
  onPhotoClick: (photoUrl: string, photoAlt: string | null) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const dragState = useRef<{ startX: number; scrollLeft: number; dragging: boolean }>({
    startX: 0,
    scrollLeft: 0,
    dragging: false,
  });

  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current = {
      startX: e.pageX,
      scrollLeft: el.scrollLeft,
      dragging: true,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !dragState.current.dragging) return;
    const dx = e.pageX - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollLeft - dx;
  };

  const endDrag = () => {
    dragState.current.dragging = false;
  };

  const scrollCards = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-review-card]');
    const step = card ? card.offsetWidth + 16 : 520;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollCards(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollCards(-1);
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [scrollCards]);

  const arrowCls =
    'w-12 h-12 rounded-full bg-off-white text-black flex items-center justify-center transition-colors duration-200 hover:bg-red hover:text-off-white disabled:opacity-40 disabled:hover:bg-off-white disabled:hover:text-black';

  return (
    <div className="relative">
      {/* side arrows — desktop overlay */}
      <div className="hidden lg:flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 pointer-events-none gap-4">
        <button
          type="button"
          onClick={() => scrollCards(-1)}
          aria-label="Previous reviews"
          className={`${arrowCls} pointer-events-auto -ml-2`}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollCards(1)}
          aria-label="Next reviews"
          className={`${arrowCls} pointer-events-auto -mr-2`}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M7.5 4.5L13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        aria-label="Customer reviews. Use arrow keys or drag to browse."
        className="flex overflow-x-auto scroll-smooth snap-x snap-proximity hide-scrollbar py-2 px-6 sm:px-10 lg:px-[14%] items-stretch gap-4 cursor-grab active:cursor-grabbing select-none focus:outline-none"
        style={{ scrollbarWidth: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            data-review-card
            className="snap-center shrink-0 w-[min(520px,calc(100vw-40px))] lg:w-[440px] first:ml-0"
          >
            <ReviewCard review={review} onPhotoClick={onPhotoClick} />
          </div>
        ))}
      </div>

      {/* mobile arrows */}
      <div className="flex lg:hidden items-center justify-end gap-3 mt-6 px-6">
        <button type="button" onClick={() => scrollCards(-1)} aria-label="Previous reviews" className={arrowCls}>
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <button type="button" onClick={() => scrollCards(1)} aria-label="Next reviews" className={arrowCls}>
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M7.5 4.5L13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
    </div>
  );
}