import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Ruler,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  X,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getProductBySlug, getRelatedProducts, SAMPLE_REVIEWS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSizeGuideOpen,
    showToast
  } = useStore();

  const product = slug ? (products.find(p => p.slug === slug) || getProductBySlug(slug)) : undefined;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'desc' | 'material' | 'fit' | 'care'>('desc');
  const [reviewsList, setReviewsList] = useState(SAMPLE_REVIEWS.general);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      window.scrollTo(0, 0);
      setActiveImageIndex(0);
      setSelectedColor(product.colors[0]?.name || 'Standard');
      setSelectedSize(product.sizes[0] || 'One Size');
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-theme-bg text-theme-text text-center px-4">
        <h1 className="text-2xl font-light tracking-tight">Product Not Found</h1>
        <p className="text-xs text-theme-muted mt-2">The requested piece could not be located in the atelier catalog.</p>
        <Link
          to="/clothing"
          className="mt-6 inline-block bg-theme-accent text-theme-accent-contrast px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Return to Collections
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const hasSale = product.salePrice && product.salePrice < product.price;
  const unitPrice = product.salePrice ?? product.price;
  const related = getRelatedProducts(product, 4);

  const handleAddBag = () => {
    if (!product.inStock) return;
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    navigate('/checkout');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewComment) return;
    const rev = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor,
      rating: newReviewRating,
      date: 'Just now',
      title: newReviewTitle || 'Verified Purchase',
      comment: newReviewComment,
      verifiedBuyer: true
    };
    setReviewsList([rev, ...reviewsList]);
    setShowReviewForm(false);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
    showToast('Thank you for sharing your review');
  };

  // Deterministic product gallery: strictly use images belonging to this exact product
  const productImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.primaryImage];

  return (
    <div className="pt-20 min-h-screen bg-theme-bg text-theme-text">
      {/* Breadcrumb Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-theme-border text-xs text-theme-muted">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="hover:text-theme-text transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to={`/${product.category}`} className="hover:text-theme-text uppercase tracking-wider transition-colors">
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to={`/${product.category}/${product.subcategory}`} className="hover:text-theme-text uppercase tracking-wider transition-colors">
              {product.subcategory.replace('-', ' ')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-theme-text font-medium truncate max-w-xs">{product.name}</li>
        </ol>
      </nav>

      {/* Main PDP Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* ==================== LEFT: IMAGE GALLERY ==================== */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnail Strip (Desktop) - only when multiple views belong to this product */}
            {productImages.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-20 flex-shrink-0">
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-[3/4] overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-theme-accent scale-105 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - view ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Active Image Viewport */}
            <div className="relative flex-1 aspect-[3/4] bg-theme-surface-subtle overflow-hidden group shadow-sm border border-theme-border">
              <img
                src={productImages[activeImageIndex] || product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 cursor-zoom-in group-hover:scale-105"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Zoom pill */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 bg-theme-surface/90 backdrop-blur-sm text-theme-text p-2.5 rounded-full shadow-md hover:bg-theme-surface border border-theme-border transition-colors"
                aria-label="View Fullscreen Lightbox"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Mobile Swipe / Index Counter */}
              {productImages.length > 1 && (
                <div className="md:hidden absolute bottom-4 left-4 bg-theme-accent/80 backdrop-blur-sm text-theme-accent-contrast px-3 py-1 text-xs font-semibold rounded-full">
                  {activeImageIndex + 1} / {productImages.length}
                </div>
              )}
            </div>
          </div>

          {/* ==================== RIGHT: PRODUCT DETAILS & PURCHASE ==================== */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-editorial text-theme-muted block mb-1">
                {product.category} • {product.subcategory.replace('-', ' ')}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-theme-text">
                {product.name}
              </h1>
              <p className="text-sm text-theme-muted font-light mt-1">
                {product.subtitle}
              </p>

              {/* Rating & Reviews Jump */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-theme-muted/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-theme-text">{product.rating.toFixed(1)}</span>
                <span className="text-theme-muted">•</span>
                <a
                  href="#customer-reviews"
                  className="text-theme-muted underline hover:text-theme-text transition-colors"
                >
                  {product.reviewCount} verified client reviews
                </a>
              </div>
            </div>

            {/* Price Block (Part I: INR Currency) */}
            <div className="flex items-baseline gap-3 py-2 border-y border-theme-border">
              {hasSale ? (
                <>
                  <span className="text-2xl sm:text-3xl font-semibold text-theme-text">
                    ₹{product.salePrice?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base text-theme-muted line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-theme-accent text-theme-accent-contrast text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 ml-2 shadow-sm">
                    Save ₹{(product.price - (product.salePrice ?? 0)).toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-semibold text-theme-text">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Color Swatch Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-semibold uppercase tracking-wider text-theme-text">
                    Color: <span className="font-light text-theme-muted">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {product.colors.map((col: any) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`relative p-1 rounded-full border transition-all ${
                        selectedColor === col.name
                          ? 'border-theme-accent ring-2 ring-theme-accent/40 ring-offset-2 ring-offset-theme-surface'
                          : 'border-theme-border hover:border-theme-accent/50'
                      }`}
                      title={col.name}
                    >
                      <span
                        className="block w-6 h-6 rounded-full border border-black/10"
                        style={{ backgroundColor: col.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection & Size Guide */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-semibold uppercase tracking-wider text-theme-text">
                  Size: <span className="font-light text-theme-muted">{selectedSize}</span>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-theme-text font-semibold underline hover:text-theme-muted transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fit Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                      selectedSize === size
                        ? 'bg-theme-accent text-theme-accent-contrast border-theme-accent'
                        : 'bg-transparent text-theme-text border-theme-border hover:border-theme-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock / Availability Status */}
            <div className="text-xs flex items-center gap-2">
              {product.inStock ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    In Stock • Ready for dispatch within 24 hours
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-theme-muted" />
                  <span className="text-theme-muted font-medium">
                    Upcoming Capsule • Restocking shortly
                  </span>
                </>
              )}
            </div>

            {/* Quantity and Primary Actions */}
            <div className="pt-2 space-y-3">
              <div className="flex gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-theme-border bg-theme-surface-subtle">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.inStock}
                    className="px-3 py-3 text-theme-text hover:bg-theme-accent/10 transition-colors disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-semibold text-theme-text">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.inStock}
                    className="px-3 py-3 text-theme-text hover:bg-theme-accent/10 transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  onClick={handleAddBag}
                  disabled={!product.inStock}
                  className="flex-1 bg-theme-accent text-theme-accent-contrast py-4 px-6 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 border transition-colors ${
                    isSaved
                      ? 'bg-theme-surface text-rose-500 border-rose-500/40 shadow-sm'
                      : 'border-theme-border hover:bg-theme-accent/5 text-theme-muted hover:text-theme-text'
                  }`}
                  aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Buy Now Direct Button */}
              {product.inStock && (
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-transparent border border-theme-border text-theme-text py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-theme-accent hover:text-theme-accent-contrast transition-colors"
                >
                  Buy Now • Instant Checkout
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-theme-border text-center text-[11px] font-light text-theme-muted">
              <div className="flex flex-col items-center gap-1.5 p-2">
                <Truck className="w-4 h-4 text-theme-accent" />
                <span>Complimentary Express Delivery Over ₹2,500</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2">
                <RotateCcw className="w-4 h-4 text-theme-accent" />
                <span>14-Day Easy Returns & Exchanges</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2">
                <ShieldCheck className="w-4 h-4 text-theme-accent" />
                <span>Artisanal Quality Guarantee</span>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="pt-2 divide-y divide-theme-border border-b border-theme-border">
              {/* Description */}
              <div className="py-3.5">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'desc' ? ('' as any) : 'desc')}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-theme-text"
                >
                  <span>Description & Craftsmanship</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === 'desc' ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'desc' && (
                  <p className="mt-3 text-xs text-theme-muted font-light leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Material */}
              <div className="py-3.5">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'material' ? ('' as any) : 'material')}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-theme-text"
                >
                  <span>Fabric & Composition</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === 'material' ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'material' && (
                  <div className="mt-3 text-xs text-theme-muted font-light leading-relaxed space-y-1">
                    <p>{product.material}</p>
                    {product.dimensions && <p>Dimensions: {product.dimensions}</p>}
                  </div>
                )}
              </div>

              {/* Fit */}
              <div className="py-3.5">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'fit' ? ('' as any) : 'fit')}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-theme-text"
                >
                  <span>Silhouette & Fit</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === 'fit' ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'fit' && (
                  <p className="mt-3 text-xs text-theme-muted font-light leading-relaxed">
                    {product.fit}
                  </p>
                )}
              </div>

              {/* Care */}
              <div className="py-3.5">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? ('' as any) : 'care')}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-theme-text"
                >
                  <span>Garment Care Instructions</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === 'care' ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'care' && (
                  <ul className="mt-3 text-xs text-theme-muted font-light list-disc pl-4 space-y-1">
                    {product.care.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== STYLING PAIRINGS ("Complete the Look") ==================== */}
        {product.suggestedPairs && product.suggestedPairs.length > 0 && (
          <section className="mt-20 pt-16 border-t border-theme-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-theme-accent" />
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted">
                Editorial Pairing
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-theme-text mb-8">
              Complete the Look
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.suggestedPairs
                .map((slug: string) => getProductBySlug(slug))
                .filter((p: any): p is NonNullable<typeof p> => p !== undefined)
                .map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </section>
        )}

        {/* ==================== CUSTOMER REVIEWS SECTION ==================== */}
        <section id="customer-reviews" className="mt-20 pt-16 border-t border-theme-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-1">
                Client Voices
              </span>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-theme-text">
                Verified Reviews ({reviewsList.length})
              </h2>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="border border-theme-border text-theme-text px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-theme-accent hover:text-theme-accent-contrast transition-colors"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {/* New Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleAddReview}
              className="bg-theme-surface-subtle p-6 border border-theme-border mb-10 space-y-4 max-w-xl"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-theme-text">
                Share Your Experience
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-theme-muted mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={e => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Amina K."
                    className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={e => setNewReviewRating(Number(e.target.value))}
                    className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  >
                    <option value={5}>5 Stars - Exceptional</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Good</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-theme-muted mb-1">Headline</label>
                <input
                  type="text"
                  value={newReviewTitle}
                  onChange={e => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Stunning drape and rich color"
                  className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="block text-xs text-theme-muted mb-1">Review</label>
                <textarea
                  rows={3}
                  required
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  placeholder="Tell us about the fit, texture, and how you styled this piece..."
                  className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              <button
                type="submit"
                className="bg-theme-accent text-theme-accent-contrast px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90"
              >
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsList.map(rev => (
              <div key={rev.id} className="p-6 bg-theme-surface border border-theme-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-theme-muted/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-theme-muted font-light">{rev.date}</span>
                </div>

                <h4 className="text-xs font-semibold text-theme-text tracking-tight">{rev.title}</h4>
                <p className="text-xs text-theme-muted font-light leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                <div className="pt-2 border-t border-theme-border flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-theme-text">{rev.author}</span>
                  {rev.verifiedBuyer && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      Verified Client
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== YOU MAY ALSO LIKE ==================== */}
        <section className="mt-20 pt-16 border-t border-theme-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-1">
                Curated Suggestions
              </span>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-theme-text">
                You May Also Like
              </h2>
            </div>
            <Link
              to={`/${product.category}`}
              className="text-xs font-semibold uppercase tracking-wider text-theme-text underline hover:text-theme-muted transition-colors"
            >
              View More in {product.category}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      {/* ==================== FULLSCREEN LIGHTBOX MODAL ==================== */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col items-center">
            <img
              src={productImages[activeImageIndex] || product.primaryImage}
              alt={product.name}
              className="max-h-[80vh] w-auto object-contain shadow-2xl"
            />
            {productImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {productImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-12 h-16 border-2 transition-all ${
                      activeImageIndex === i ? 'border-white scale-105' : 'border-transparent opacity-50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
