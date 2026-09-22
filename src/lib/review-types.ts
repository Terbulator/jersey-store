export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5
  title: string;
  body: string;
  productId: string;
  productName: string;
  productVariant: string;
  photoUrl: string | null;
  photoAlt: string | null;
  verifiedBuyer: boolean;
  status: ReviewStatus;
  featured: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ReviewDraft {
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  body: string;
  productId: string;
  productName: string;
  productVariant: string;
  photoUrl?: string | null;
  photoAlt?: string | null;
}

export type ReviewSort = 'featured-first';