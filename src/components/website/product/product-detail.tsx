'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Minus,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  Shield,
  Headphones,
  X,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Category, Edition, Product } from '@/lib/storefront-types';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { ProductGrid } from '@/components/website/product/product-grid';
import { editionLabel, metaLine } from '@/lib/catalog';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';
import { trackEvent } from '@/lib/analytics';
import { DISPLAY_DEFAULTS, type DetailDisplay } from '@/lib/display';

export function ProductDetail({
  product,
  categories,
  editions,
  related,
  display,
}: {
  product: Product;
  categories: Category[];
  editions: Edition[];
  related: Product[];
  display?: DetailDisplay;
}) {
  const D = { ...DISPLAY_DEFAULTS.detail, ...display };
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: product.basePrice,
    });
  }, [product]);

  const images = product.images?.length ? product.images : [product.image];
  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const category = categories.find((c) => c.slug === product.category);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      openCart();
    }, 800);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, quantity);
    window.location.href = '/checkout';
  };

  const detailSections = [
    { id: 'description', title: 'Description', content: product.description },
    { id: 'fit', title: 'Fit', content: product.fit },
    { id: 'material', title: 'Material', content: product.material },
    { id: 'care', title: 'Care', content: product.care },
    { id: 'shipping', title: 'Shipping & Returns', content: `${product.shipping}. ${product.returns}.` },
  ].filter((s) => s.content && (s.id !== 'shipping' || D.show_shipping));

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
    : 0;

  return (
    <>
      <section className="pt-32 sm:pt-44 pb-10 sm:pb-16 px-6 sm:px-8 lg:px-12 bg-black">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/40 mb-6 sm:mb-10"
          >
            <Link href="/" className="hover:text-off-white transition-colors">Home</Link>
            <span className="mx-2 text-red">/</span>
            <Link href="/shop" className="hover:text-off-white transition-colors">Shop</Link>
            <span className="mx-2 text-red">/</span>
            <Link href={`/shop/${product.category}`} className="hover:text-off-white transition-colors">
              {category?.name ?? product.category}
            </Link>
            <span className="mx-2 text-red">/</span>
            <span className="text-off-white/80">{product.name}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_PREMIUM }}
            >
              <div className={D.thumbs_position === 'side' && images.length > 1 ? 'flex flex-col-reverse gap-4 lg:flex-row' : ''}>
              <div
                className={cn(
                  'relative aspect-[3/4] bg-charcoal overflow-hidden cursor-zoom-in rounded-xl',
                  D.thumbs_position === 'side' && images.length > 1 && 'flex-1'
                )}
                onClick={() => {
                  setViewerIndex(currentImage);
                  setShowImageViewer(true);
                }}
              >
                <AnimatePresence mode="wait">
                  <Image
                    key={currentImage}
                    src={images[currentImage]}
                    alt={product.imageAlt || product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </AnimatePresence>
                {product.badge && (
                  <span
                    className={cn(
                      'absolute top-4 left-4 px-3 py-1 font-mono-meta text-[9px] tracking-widest',
                      product.badge === 'NEW' && 'bg-red text-off-white',
                      product.badge === 'SALE' && 'bg-off-white text-black',
                      product.badge === 'LIMITED' && 'bg-black/70 text-off-white backdrop-blur-sm'
                    )}
                  >
                    {product.badge}
                  </span>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-black/60 text-off-white/70 text-[10px] tracking-wider backdrop-blur-sm rounded-full">
                    {currentImage + 1} / {images.length}
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-off-white hover:bg-black/80 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-off-white hover:bg-black/80 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className={D.thumbs_position === 'side'
                  ? 'flex gap-3 overflow-x-auto pb-2 scrollbar-none lg:flex-col lg:overflow-visible lg:pb-0 lg:w-20 lg:shrink-0'
                  : 'flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none'
                }>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={cn(
                        'relative w-20 aspect-[3/4] flex-shrink-0 bg-charcoal rounded-lg overflow-hidden border transition-all duration-200',
                        currentImage === i ? 'border-red opacity-100' : 'border-white/10 opacity-50 hover:opacity-80'
                      )}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
              </div>
            </motion.div>

            {/* Product Details */}
            <div>
              <p className="font-mono-meta text-[10px] tracking-[0.3em] uppercase text-red mb-2">
                {editionLabel(editions, product.edition)}
              </p>
              <h1 className="headline text-3xl sm:text-4xl text-off-white leading-tight">
                {product.name}
              </h1>
              <p className="font-mono-meta text-[10px] text-off-white/40 mt-2">
                {metaLine(product, editions)}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-6">
                <span className="text-2xl text-off-white font-medium">{formatPrice(product.basePrice)}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-sm text-off-white/40 line-through">{formatPrice(product.comparePrice)}</span>
                    <span className="text-[11px] text-red font-medium tracking-wider">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Size Selector */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/50">
                    Select Size {selectedSize && `- ${selectedSize}`}
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] text-off-white/50 hover:text-off-white transition-colors tracking-wider underline underline-offset-4"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'w-12 h-12 text-[11px] border transition-all duration-200 rounded-full',
                        selectedSize === size
                          ? 'border-red bg-red text-off-white'
                          : 'border-white/15 text-off-white/60 hover:border-off-white hover:text-off-white'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-[11px] text-off-white/30 mt-2.5">Please select a size</p>
                )}
              </div>

              {/* Quantity */}
              {D.show_quantity && (
              <div className="mt-6">
                <span className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/50 block mb-3">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-white/15 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-off-white/60 hover:text-off-white disabled:opacity-30 transition-colors rounded-l-full"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm text-off-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-off-white/60 hover:text-off-white transition-colors rounded-r-full"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || addedToCart}
                  className={cn(
                    'flex-1 btn-pill transition-colors',
                    addedToCart
                      ? 'bg-silver text-black'
                      : selectedSize
                        ? 'btn-pill-solid'
                        : 'bg-white/5 text-off-white/40 cursor-not-allowed'
                  )}
                >
                  {addedToCart ? 'Added to Bag' : 'Add to Bag'}
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    'w-12 h-12 flex items-center justify-center rounded-full border transition-colors',
                    isWishlisted
                      ? 'border-red bg-red/10 text-red'
                      : 'border-white/15 text-off-white/60 hover:border-off-white hover:text-off-white'
                  )}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
                </button>
              </div>

              {D.show_buy_now && (
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize}
                className={cn(
                  'w-full mt-3 btn-pill btn-pill-outline transition-opacity',
                  !selectedSize && 'opacity-40 cursor-not-allowed'
                )}
              >
                Buy Now
              </button>
              )}
              {/* Trust */}
              {D.show_trust && (
              <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/10 mt-8 mb-6">
                {[
                  { icon: Truck, text: 'Free shipping above ₹999' },
                  { icon: RotateCcw, text: '30-day easy returns' },
                  { icon: Shield, text: 'Secure checkout' },
                  { icon: Headphones, text: 'Customer support' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-off-white/50 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[11px] text-off-white/50 tracking-wide">{text}</span>
                  </div>
                ))}
              </div>
              )}

              {/* Accordion */}
              {D.show_accordions && (
              <div className="divide-y divide-white/10">
                {detailSections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="font-mono-meta text-[10px] tracking-widest uppercase text-off-white/70">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-off-white/40 transition-transform duration-200',
                          openAccordion === section.id && 'rotate-180'
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300',
                        openAccordion === section.id ? 'max-h-40 pb-4' : 'max-h-0'
                      )}
                    >
                      <p className="text-xs text-off-white/50 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Related */}
          {D.related_count > 0 && related.slice(0, D.related_count).length > 0 && (
            <div className="mt-20 sm:mt-28">
              <div className="flex items-end justify-between mb-8">
                <h2 className="headline text-2xl sm:text-3xl text-off-white">{D.related_title}</h2>
                <Link href="/shop" className="font-mono-meta text-[9px] text-off-white/50 hover:text-off-white tracking-widest uppercase underline underline-offset-4">
                  View all
                </Link>
              </div>
              <ProductGrid products={related.slice(0, D.related_count)} editions={editions} />
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sticky Purchase Bar */}
      <div
        className={cn(
          'lg:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-white/10 px-4 py-3.5 z-40 transition-transform duration-300 backdrop-blur-md',
          isScrolled ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-off-white font-medium">{formatPrice(product.basePrice * quantity)}</p>
            {product.comparePrice && (
              <p className="text-[10px] text-off-white/40 line-through">{formatPrice(product.comparePrice * quantity)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || addedToCart}
            className={cn(
              'flex-1 py-3.5 text-[11px] tracking-widest uppercase font-mono-meta transition-colors rounded-full',
              addedToCart
                ? 'bg-silver text-black'
                : selectedSize
                  ? 'bg-red text-off-white'
                  : 'bg-white/10 text-off-white/40'
            )}
          >
            {addedToCart ? 'Added' : 'Add to Bag'}
          </button>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
            />
            <motion.div
              className="relative bg-charcoal border border-white/10 max-w-md w-full max-h-[80vh] overflow-y-auto p-6 rounded-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="headline text-lg text-off-white">Size Guide</h3>
                <button onClick={() => setShowSizeGuide(false)} className="text-off-white/50 hover:text-off-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-off-white/50 mb-4">All measurements are in centimeters (cm).</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 font-medium text-off-white">Size</th>
                    <th className="text-left py-2 font-medium text-off-white">Chest</th>
                    <th className="text-left py-2 font-medium text-off-white">Length</th>
                    <th className="text-left py-2 font-medium text-off-white">Shoulder</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'S', chest: '96', length: '68', shoulder: '44' },
                    { size: 'M', chest: '102', length: '70', shoulder: '46' },
                    { size: 'L', chest: '108', length: '72', shoulder: '48' },
                    { size: 'XL', chest: '114', length: '74', shoulder: '50' },
                    { size: 'XXL', chest: '120', length: '76', shoulder: '52' },
                  ].map((row) => (
                    <tr key={row.size} className="border-b border-white/5">
                      <td className="py-2 text-off-white">{row.size}</td>
                      <td className="py-2 text-off-white/50">{row.chest}</td>
                      <td className="py-2 text-off-white/50">{row.length}</td>
                      <td className="py-2 text-off-white/50">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="font-mono-meta text-[9px] text-off-white/30 mt-3">
                Measurements may vary by ±2cm.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Viewer */}
      <AnimatePresence>
        {showImageViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[65] bg-black/95 flex items-center justify-center"
          >
            <button
              onClick={() => setShowImageViewer(false)}
              className="absolute top-5 right-5 text-off-white/60 hover:text-off-white z-10 transition-colors"
              aria-label="Close viewer"
            >
              <X className="w-6 h-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setViewerIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-off-white hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewerIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-off-white hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="relative max-w-[90vw] max-h-[85vh]">
              <Image
                src={images[viewerIndex]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>
            <div className="absolute bottom-6 font-mono-meta text-[10px] text-off-white/60">
              {viewerIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:hidden h-16" />
    </>
  );
}