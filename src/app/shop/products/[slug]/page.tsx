'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Minus, Plus, ChevronDown, ChevronLeft, ChevronRight, Truck, RotateCcw, Shield, Headphones, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { PRODUCTS } from '@/data/products';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { ProductCard } from '@/components/website/product/product-card';
import type { Product } from '@/data/products';

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

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product?.id || ''));

  if (!product) {
    return (
      <section className="py-24 px-4 text-center">
        <h2 className="text-2xl font-bold text-charcoal mb-4">Product not found</h2>
        <Link href="/shop" className="text-blood-red text-xs tracking-widest uppercase hover:underline">
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
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-[11px] tracking-widest uppercase text-chrome mb-6 sm:mb-8">
            <Link href="/" className="hover:text-blood-red transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-blood-red transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-blood-red transition-colors">{product.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Gallery */}
            <div>
              {/* Main Image */}
              <div
                className="relative aspect-[3/4] bg-white border border-charcoal/5 overflow-hidden cursor-zoom-in mb-3"
                onClick={() => {
                  setViewerIndex(currentImage);
                  setShowImageViewer(true);
                }}
              >
                <img
                  src={images[currentImage]}
                  alt={product.imageAlt || product.name}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-blood-red text-off-white text-[10px] tracking-widest uppercase">
                    {product.badge}
                  </span>
                )}
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-charcoal/70 text-off-white text-[10px] tracking-wider">
                    {currentImage + 1} / {images.length}
                  </div>
                )}
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={cn(
                        'flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 border-2 transition-all duration-200',
                        currentImage === i ? 'border-blood-red opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                      )}
                    >
                      <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info (sticky on desktop) */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-blood-red text-[10px] tracking-[0.3em] uppercase mb-2">
                {product.edition === 'player' ? 'Player Version' : product.edition === 'master' ? 'Master Edition' : 'Special Edition'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal mb-1">{product.name}</h1>
              <p className="text-xs text-chrome mb-4">{product.team} · {product.season}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-charcoal">{formatPrice(product.basePrice)}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-sm text-chrome line-through">{formatPrice(product.comparePrice)}</span>
                    <span className="text-[11px] text-blood-red font-medium tracking-wider">
                      -{Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] tracking-widest uppercase text-charcoal font-medium">
                    Select Size {selectedSize && `- ${selectedSize}`}
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] text-blood-red hover:underline tracking-wider"
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
                        'w-12 h-12 text-[11px] tracking-wider border transition-all duration-200',
                        selectedSize === size
                          ? 'border-blood-red bg-blood-red text-off-white'
                          : 'border-charcoal/20 bg-white text-charcoal hover:border-charcoal'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-[11px] text-chrome/60 mt-2">Please select a size</p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-5">
                <span className="text-[11px] tracking-widest uppercase text-charcoal font-medium block mb-2.5">Quantity</span>
                <div className="inline-flex items-center border border-charcoal/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-off-white disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-off-white transition-colors"
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
                    'flex-1 py-4 text-[11px] tracking-widest uppercase font-medium transition-all duration-300',
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : selectedSize
                      ? 'bg-blood-red text-off-white hover:bg-charcoal'
                      : 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
                  )}
                >
                  {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    'w-12 h-12 flex items-center justify-center border transition-colors',
                    isWishlisted
                      ? 'border-blood-red bg-blood-red/5 text-blood-red'
                      : 'border-charcoal/20 text-charcoal hover:border-blood-red'
                  )}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
                </button>
              </div>

              {selectedSize && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 border border-charcoal text-[11px] tracking-widest uppercase font-medium text-charcoal hover:bg-charcoal hover:text-off-white transition-colors mb-6"
                >
                  Buy Now
                </button>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 py-5 border-y border-charcoal/10 mb-6">
                {[
                  { icon: Truck, text: 'Free shipping above ₹999' },
                  { icon: RotateCcw, text: '30-day easy returns' },
                  { icon: Shield, text: 'Secure checkout' },
                  { icon: Headphones, text: 'Customer support' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-blood-red flex-shrink-0" />
                    <span className="text-[10px] text-chrome tracking-wider">{text}</span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div className="divide-y divide-charcoal/10">
                {detailSections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleAccordion(section.id)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-[11px] tracking-widest uppercase font-medium text-charcoal">{section.title}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-chrome transition-transform duration-200',
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
                      <p className="text-xs text-chrome/80 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 sm:mt-24 pt-8 border-t border-charcoal/10">
              <h2 className="text-[11px] tracking-widest uppercase text-blood-red mb-6">You May Also Like</h2>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal/10 px-4 py-3 z-30">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-bold text-charcoal">{formatPrice(product.basePrice * quantity)}</p>
            {product.comparePrice && (
              <p className="text-[10px] text-chrome line-through">{formatPrice(product.comparePrice * quantity)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || addedToCart}
            className={cn(
              'flex-1 py-3 text-[11px] tracking-widest uppercase font-medium transition-colors',
              addedToCart
                ? 'bg-green-600 text-white'
                : selectedSize
                ? 'bg-blood-red text-off-white'
                : 'bg-charcoal/10 text-charcoal/40'
            )}
          >
            {addedToCart ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSizeGuide(false)} />
          <div className="relative bg-white max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-widest uppercase">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-chrome hover:text-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-chrome mb-4">All measurements are in centimeters (cm).</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="text-left py-2 font-medium text-charcoal">Size</th>
                  <th className="text-left py-2 font-medium text-charcoal">Chest</th>
                  <th className="text-left py-2 font-medium text-charcoal">Length</th>
                  <th className="text-left py-2 font-medium text-charcoal">Shoulder</th>
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
                  <tr key={row.size} className="border-b border-charcoal/5">
                    <td className="py-2 font-medium text-charcoal">{row.size}</td>
                    <td className="py-2 text-chrome">{row.chest}</td>
                    <td className="py-2 text-chrome">{row.length}</td>
                    <td className="py-2 text-chrome">{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-chrome/60 mt-3">Measurements may vary by ±2cm.</p>
          </div>
        </div>
      )}

      {/* Full-screen Image Viewer */}
      {showImageViewer && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            aria-label="Close viewer"
          >
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setViewerIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewerIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
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
          <div className="absolute bottom-6 text-white/50 text-xs tracking-wider">
            {viewerIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Bottom spacer for mobile sticky bar */}
      <div className="lg:hidden h-16" />
    </>
  );
}
