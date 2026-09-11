import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useStore();
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name || 'Standard'
  );
  const [activeImage, setActiveImage] = useState(product.primaryImage);
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isSaved = isInWishlist(product.id);
  const hasSale = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasSale
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  // Deterministic product image mapping:
  // ONLY use an alternate angle if it explicitly belongs to the same product.
  // If a product has only one valid image, primaryImage = same image, hoverImage = same image.
  // NEVER borrow an image from another product.
  const hoverImage =
    product.images && product.images.length > 1
      ? product.images[1]
      : product.primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    const defaultSize = product.sizes[0] || 'Standard';
    addToCart(product, selectedColor, defaultSize, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleColorSelect = (e: React.MouseEvent, colorName: string, colorImg?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(colorName);
    if (colorImg) {
      setActiveImage(colorImg);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-theme-surface border border-theme-border/70 rounded-none overflow-hidden transition-all duration-300 hover:border-theme-accent/50 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-theme-surface-subtle">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && hoverImage ? hoverImage : activeImage}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!product.inStock ? (
            <span className="bg-theme-accent text-theme-accent-contrast text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 shadow-sm">
              Coming Soon
            </span>
          ) : hasSale ? (
            <span className="bg-rose-700 dark:bg-rose-800 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 shadow-sm border border-rose-600/30">
              Sale {discountPercent > 0 ? `-${discountPercent}%` : ''}
            </span>
          ) : product.isNew ? (
            <span className="bg-theme-surface text-theme-text text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-theme-border shadow-sm">
              New
            </span>
          ) : product.isBestSeller ? (
            <span className="bg-theme-surface/95 backdrop-blur-sm text-theme-text text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-theme-border shadow-sm">
              Bestseller
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 shadow-sm border ${
            isSaved
              ? 'bg-theme-surface text-rose-500 border-rose-500/40 shadow-rose-500/10'
              : 'bg-theme-surface/90 text-theme-muted hover:text-theme-text border-theme-border/70 hover:bg-theme-surface hover:border-theme-border'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick Add Overlay on Hover */}
        {product.inStock && (
          <div className="absolute inset-x-3 bottom-3 z-10 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-theme-accent text-theme-accent-contrast py-2.5 px-4 text-xs font-semibold uppercase tracking-widest hover:opacity-95 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 bg-theme-surface">
        {/* Category & Subcategory Label */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] uppercase font-semibold text-theme-muted tracking-editorial line-clamp-1">
            {product.subcategory || product.category}
          </span>
          {product.material && (
            <span className="text-[9px] uppercase tracking-wider text-theme-muted/80 font-light border border-theme-border/50 px-1.5 py-0.5">
              {product.material}
            </span>
          )}
        </div>

        {/* Color Swatches & Variant Label */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              {product.colors.slice(0, 5).map(col => (
                <button
                  key={col.name}
                  onClick={e => handleColorSelect(e, col.name, col.image)}
                  title={col.name}
                  aria-label={col.name}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColor === col.name
                      ? 'border-theme-accent scale-110 ring-1 ring-theme-accent/60 ring-offset-1 ring-offset-theme-surface'
                      : 'border-theme-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              ))}
            </div>
            {product.colors.length > 1 && (
              <span className="text-[10px] text-theme-muted font-light ml-1">
                +{product.colors.length} shades
              </span>
            )}
            {selectedColor && (
              <span className="text-[10px] text-theme-text/80 font-medium ml-auto line-clamp-1">
                {selectedColor}
              </span>
            )}
          </div>
        )}

        {/* Title & Subtitle */}
        <Link to={`/product/${product.slug}`} className="block group/link">
          <h3 className="text-sm font-medium text-theme-text tracking-tight group-hover/link:underline line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-theme-muted font-light mt-0.5 line-clamp-1">
            {product.subtitle}
          </p>
        </Link>

        {/* Price in INR & Discount & Rating */}
        <div className="mt-3 pt-2.5 border-t border-theme-border/40 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 flex-wrap">
            {hasSale ? (
              <>
                <span className="text-theme-text font-bold text-sm">
                  ₹{product.salePrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-theme-muted line-through text-[11px]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {discountPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
                    {discountPercent}% OFF
                  </span>
                )}
              </>
            ) : (
              <span className="text-theme-text font-semibold text-sm">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="text-[11px] text-theme-muted flex items-center gap-1 font-light ml-auto">
            <span className="text-amber-500 dark:text-amber-400">★ {product.rating.toFixed(1)}</span>
            <span className="text-theme-muted/70">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
