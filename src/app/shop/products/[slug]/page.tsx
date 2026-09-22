'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, ChevronDown, ChevronLeft, ChevronRight, Truck, RotateCcw, Shield, Headphones, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { PRODUCTS } from '@/data/products';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { ProductCard } from '@/components/website/product/product-card';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { EASE_PREMIUM } from '@/components/motion/motion-variants';

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product?.id || ''));

  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ rootMargin: '-100px' });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) {
    return (
      <section className="py-24 px-4 text-center bg-navy">
        <h2 className="text-2xl font-bold text-off-white mb-4">Product not found</h2>
        <Link href="/shop" className="text-gold text-xs tracking-widest uppercase hover:text-sage transition-colors underline">
          Back to Shop
        </Link>
      </section>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.team === product.team)
  ).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize);
    }
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

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const detailSections = [
    { id: 'description', title: 'Description', content: product.description },
    { id: 'fit', title: 'Fit', content: product.fit },
    { id: 'material', title: 'Material', content: product.material },
    { id: 'care', title: 'Care', content: product.care },
    { id: 'shipping', title: 'Shipping & Returns', content: `${product.shipping}. ${product.returns}.` },
  ].filter((s) => s.content);

  return (
    <>
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-navy">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="text-[11px] tracking-widest uppercase text-sage/60 mb-6 sm:mb-8"
          >
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-gold transition-colors">{product.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-off-white">{product.name}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Gallery */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, ease: EASE_PREMIUM }}
            >
              {/* Main Image */}
              <div
                className="relative aspect-[3/4] bg-navy-deep border border-gold/15 overflow-hidden cursor-zoom-in rounded-sm mb-3"
                onClick={() => {
                  setViewerIndex(currentImage);
                  setShowImageViewer(true);
                }}
              >
                <img
                  src={images[currentImage]}
                  alt={product.imageAlt || product.name}
                  className="w-full h-full object-cover transition-opacity duration-700"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-navy-deep text-[10px] tracking-widest uppercase font-medium">
                    {product.badge}
                  </span>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-navy-deep/80 text-sage text-[10px] tracking-wider border border-gold/20">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-navy-deep/60 backdrop-blur-md border border-gold/20 flex items-center justify-center text-sage hover:text-gold hover:border-gold/50 transition-colors rounded-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-navy-deep/60 backdrop-blur-md border border-gold/20 flex items-center justify-center text-sage hover:text-gold hover:border-gold/50 transition-colors rounded-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={cn(
                        'flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 border transition-all duration-200 rounded-sm overflow-hidden',
                        currentImage === i ? 'border-gold opacity-100' : 'border-gold/15 opacity-50 hover:opacity-90'
                      )}
                    >
                      <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info (sticky on desktop) */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-2">
                {product.edition === 'player' ? 'Player Version' : product.edition === 'master' ? 'Master Edition' : 'Special Edition'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-off-white mb-1">{product.name}</h1>
              <p className="text-xs text-sage/70 mb-4">{product.team} · {product.season}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-gold">{formatPrice(product.basePrice)}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-sm text-sage/50 line-through">{formatPrice(product.comparePrice)}</span>
                    <span className="text-[11px] text-gold font-medium tracking-wider">
                      -{Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] tracking-widest uppercase text-sage font-medium">
                    Select Size {selectedSize && `- ${selectedSize}`}
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] text-gold hover:text-sage transition-colors tracking-wider"
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
                        'w-12 h-12 text-[11px] tracking-wider border transition-all duration-200 rounded-sm',
                        selectedSize === size
                          ? 'border-gold bg-gold text-navy-deep font-semibold'
                          : 'border-gold/20 bg-navy-deep/40 text-sage hover:border-gold/60 hover:text-off-white'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-[11px] text-sage/50 mt-2">Please select a size</p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-5">
                <span className="text-[11px] tracking-widest uppercase text-sage font-medium block mb-2.5">Quantity</span>
                <div className="inline-flex items-center border border-gold/20 rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-sage hover:text-gold disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-medium text-off-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-sage hover:text-gold transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || addedToCart}
                  className={cn(
                    'flex-1 py-4 text-[11px] tracking-widest uppercase font-semibold transition-all duration-300 rounded-sm',
                    addedToCart
                      ? 'bg-sage text-navy-deep'
                      : selectedSize
                      ? 'bg-gold text-navy-deep hover:bg-sage'
                      : 'bg-white/5 text-sage/40 cursor-not-allowed'
                  )}
                >
                  {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    'w-12 h-12 flex items-center justify-center border rounded-sm transition-colors',
                    isWishlisted
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-gold/20 text-sage hover:border-gold hover:text-gold'
                  )}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
                </button>
              </div>

              {selectedSize && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 border border-gold/30 text-[11px] tracking-widest uppercase font-medium text-sage hover:bg-gold hover:text-navy-deep transition-all duration-300 rounded-sm mb-6"
                >
                  Buy Now
                </button>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 py-5 border-y border-gold/10 mb-6">
                {[
                  { icon: Truck, text: 'Free shipping above ₹999' },
                  { icon: RotateCcw, text: '30-day easy returns' },
                  { icon: Shield, text: 'Secure checkout' },
                  { icon: Headphones, text: 'Customer support' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    <span className="text-[10px] text-sage/60 tracking-wider">{text}</span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div className="divide-y divide-gold/10">
                {detailSections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleAccordion(section.id)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-[11px] tracking-widest uppercase font-medium text-sage">{section.title}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-gold/60 transition-transform duration-200',
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
                      <p className="text-xs text-sage/60 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 sm:mt-24 pt-8 border-t border-gold/10">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-8 h-px bg-gold/40" />
                <h2 className="text-[11px] tracking-widest uppercase text-gold">You May Also Like</h2>
                <span className="flex-1 h-px bg-gold/10" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sticky Purchase Bar */}
      <div
        className={cn(
          'lg:hidden fixed bottom-0 left-0 right-0 bg-navy-deep border-t border-gold/20 px-4 py-3 z-30 transition-transform duration-300',
          isScrolled ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-bold text-gold">{formatPrice(product.basePrice * quantity)}</p>
            {product.comparePrice && (
              <p className="text-[10px] text-sage/50 line-through">{formatPrice(product.comparePrice * quantity)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || addedToCart}
            className={cn(
              'flex-1 py-3 text-[11px] tracking-widest uppercase font-semibold transition-colors rounded-sm',
              addedToCart
                ? 'bg-sage text-navy-deep'
                : selectedSize
                ? 'bg-gold text-navy-deep'
                : 'bg-white/5 text-sage/40'
            )}
          >
            {addedToCart ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowSizeGuide(false)}
          />
          <motion.div
            className="relative bg-navy-deep border border-gold/20 max-w-md w-full max-h-[80vh] overflow-y-auto p-6 rounded-sm"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE_PREMIUM }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-widest uppercase text-off-white">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-sage/60 hover:text-gold transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-sage/60 mb-4">All measurements are in centimeters (cm).</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gold/15">
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
                  <tr key={row.size} className="border-b border-gold/10">
                    <td className="py-2 font-medium text-sage">{row.size}</td>
                    <td className="py-2 text-sage/60">{row.chest}</td>
                    <td className="py-2 text-sage/60">{row.length}</td>
                    <td className="py-2 text-sage/60">{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-sage/40 mt-3">Measurements may vary by ±2cm.</p>
          </motion.div>
        </div>
      )}

      {/* Full-screen Image Viewer */}
      {showImageViewer && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute top-4 right-4 text-sage/60 hover:text-gold z-10 transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setViewerIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gold/10 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-sage hover:text-gold transition-colors rounded-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewerIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gold/10 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-sage hover:text-gold transition-colors rounded-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={images[viewerIndex]}
            alt={product.name}
            className="max-w-[90vw] max-h-[85vh] object-contain"
          />
          <div className="absolute bottom-6 text-gold/60 text-xs tracking-wider">
            {viewerIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Bottom spacer for mobile sticky bar */}
      <div className="lg:hidden h-16" />
    </>
  );
}