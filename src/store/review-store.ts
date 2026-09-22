'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review, ReviewDraft, ReviewStatus } from '@/lib/review-types';
import { SEED_REVIEWS } from '@/data/reviews';

interface ReviewState {
  reviews: Review[];
  submitReview: (draft: ReviewDraft) => void;
  setStatus: (id: string, status: ReviewStatus) => void;
  setFeatured: (id: string, featured: boolean) => void;
  setVerified: (id: string, verified: boolean) => void;
  removeReview: (id: string) => void;
  approvedReviews: () => Review[];
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: SEED_REVIEWS,

      submitReview: (draft) => {
        const review: Review = {
          id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          customerName: draft.customerName.trim(),
          customerEmail: draft.customerEmail.trim().toLowerCase(),
          rating: Math.max(1, Math.min(5, Math.round(draft.rating))),
          title: draft.title.trim(),
          body: draft.body.trim(),
          productId: draft.productId,
          productName: draft.productName,
          productVariant: draft.productVariant,
          photoUrl: draft.photoUrl ?? null,
          photoAlt: draft.photoAlt ?? null,
          verifiedBuyer: false, // only set via moderation
          status: 'pending', // must go through moderation
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ reviews: [review, ...state.reviews] }));
      },

      setStatus: (id, status) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id
              ? { ...r, status, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      setFeatured: (id, featured) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id
              ? { ...r, featured, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      setVerified: (id, verified) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id
              ? { ...r, verifiedBuyer: verified, updatedAt: new Date().toISOString() }
              : r
          ),
        })),

      removeReview: (id) =>
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== id),
        })),

      approvedReviews: () =>
        get()
          .reviews.filter((r) => r.status === 'approved')
          .sort((a, b) => {
            if (a.featured !== b.featured) return a.featured ? -1 : 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }),
    }),
    { name: 'headerr-reviews' }
  )
);