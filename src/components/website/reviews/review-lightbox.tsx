'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function ReviewLightbox({
  photoUrl,
  photoAlt,
  onClose,
}: {
  photoUrl: string | null;
  photoAlt: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!photoUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [photoUrl, onClose]);

  return (
    <AnimatePresence>
      {photoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Review photo"
        >
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photoUrl}
              alt={photoAlt ?? 'Customer review photo'}
              className="w-full max-h-[80vh] object-contain rounded-[4px]"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close photo"
              className="absolute -top-2 -right-2 w-11 h-11 rounded-full bg-off-white text-black flex items-center justify-center hover:bg-red hover:text-off-white transition-colors duration-200"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}