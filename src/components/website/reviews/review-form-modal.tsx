'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Star } from 'lucide-react';
import type { Edition, Product } from '@/lib/storefront-types';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

function readAndResize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED.includes(file.type)) {
      reject(new Error('JPG, PNG or WEBP only'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('Max photo size is 5MB'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIDE = 1400;
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Could not read image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

const variantOf = (p: Product, editions: Edition[]) =>
  editions.find((e) => e.slug === p.edition)?.name ?? p.edition;

export function ReviewFormModal({
  open,
  onClose,
  products,
  editions,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  editions: Edition[];
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [productId, setProductId] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const product = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [productId, products]
  );

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setError(null);
      setPhotoError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const onFile = async (file?: File | null) => {
    setPhotoError(null);
    if (!file) return;
    try {
      const url = await readAndResize(file);
      setPhoto(url);
    } catch (err) {
      setPhotoError((err as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || rating < 1 || !title.trim() || !body.trim() || !product) {
      setError('Please fill in all required fields and pick a rating + product.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          rating,
          title: title.trim(),
          body: body.trim(),
          productId: product.id,
          photoUrl: photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit your review.');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const labelCls = 'font-mono-meta text-[10px] text-chrome mb-2 block';
  const inputCls =
    'w-full bg-transparent border border-black/20 rounded-[4px] px-4 py-3 text-[15px] text-black placeholder:text-black/35 focus:outline-none focus:border-red transition-colors';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Write a review"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[560px] bg-off-white text-black rounded-[6px] shadow-2xl max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close review form"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black text-off-white flex items-center justify-center hover:bg-red transition-colors duration-200 z-10"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {submitted ? (
              <div className="p-8 sm:p-10 text-center">
                <p className="font-display text-3xl text-black mb-3">Review submitted.</p>
                <p className="text-[15px] text-charcoal/70 leading-relaxed max-w-[340px] mx-auto">
                  Your review is awaiting moderation. You{"'"}ll be able to see it on the site once
                  it{"'"}s approved.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center justify-center h-[50px] px-8 rounded-full bg-black text-off-white text-[13px] font-medium uppercase tracking-[0.05em] hover:bg-red transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                <p className="font-mono-meta text-[10px] text-red mb-2">Your Say</p>
                <h2 className="font-display text-3xl sm:text-[34px] leading-none text-black mb-6">
                  Write a Review
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className={labelCls} htmlFor="rev-name">Name</label>
                    <input
                      id="rev-name"
                      className={inputCls}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="rev-email">Email</label>
                    <input
                      id="rev-email"
                      type="email"
                      className={inputCls}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <span className={labelCls}>Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i)}
                        aria-label={`${i} star${i > 1 ? 's' : ''}`}
                        className="p-0.5"
                      >
                        <Star
                          className={i <= rating ? 'text-red fill-red' : 'text-black/20'}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[12px] text-black/40">Tap a star to rate.</p>
                </div>

                <div className="mb-5">
                  <label className={labelCls} htmlFor="rev-product">Product</label>
                  <select
                    id="rev-product"
                    className={`${inputCls} appearance-none`}
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {variantOf(p, editions)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className={labelCls} htmlFor="rev-title">Review Title</label>
                  <input
                    id="rev-title"
                    className={inputCls}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Quality is insane."
                    required
                  />
                </div>

                <div className="mb-5">
                  <label className={labelCls} htmlFor="rev-body">Your Review</label>
                  <textarea
                    id="rev-body"
                    className={`${inputCls} min-h-[110px] resize-y`}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell us about the fit, fabric, delivery..."
                    required
                  />
                </div>

                <div className="mb-6">
                  <span className={labelCls}>Photo (optional)</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border border-dashed border-black/30 rounded-[4px] py-4 text-[13px] text-black/60 hover:border-red hover:text-red transition-colors duration-200"
                  >
                    {photo ? 'Change photo' : 'Upload photo — JPG, PNG or WEBP, max 5MB'}
                  </button>
                  {photo && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={photo} alt="Preview" className="w-14 h-14 object-cover rounded-[4px]" />
                      <span className="text-[12px] text-navy">Photo added. Will be shown after approval.</span>
                    </div>
                  )}
                  {photoError && <p className="mt-2 text-[12px] text-red">{photoError}</p>}
                </div>

                <p className="text-[12px] text-black/45 mb-5">
                  Your email will not be shown publicly.
                </p>

                {error && (
                  <p className="text-[13px] text-red mb-4 border border-red/40 rounded-[4px] px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center h-[50px] rounded-full bg-black text-off-white text-[13px] font-medium uppercase tracking-[0.05em] hover:bg-red transition-colors duration-200 disabled:opacity-60"
                >
                  {busy ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}