import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, addToCart, showToast, products } = useStore();

  const savedProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAll = () => {
    savedProducts.forEach(prod => {
      if (prod.inStock) {
        addToCart(prod, prod.colors[0]?.name || 'Standard', prod.sizes[0] || 'One Size', 1);
      }
    });
    showToast('Added all available wishlist items to bag');
  };

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-theme-border mb-10 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-editorial text-theme-muted block mb-1">
              Curated Selection
            </span>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-theme-text">
              Saved Wishlist ({savedProducts.length})
            </h1>
          </div>

          {savedProducts.length > 0 && (
            <button
              onClick={handleAddAll}
              className="bg-theme-accent text-theme-accent-contrast px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto"
            >
              Add All to Bag
            </button>
          )}
        </div>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {savedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-theme-surface border border-theme-border p-16 sm:p-24 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-theme-surface-subtle mx-auto flex items-center justify-center text-theme-muted">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-light tracking-tight text-theme-text">
              Your wishlist is empty.
            </h2>
            <p className="text-xs text-theme-muted font-light leading-relaxed max-w-sm mx-auto">
              Discover something made for your story. Tap the heart on any creation to curate your personal wardrobe edit.
            </p>
            <div className="pt-4">
              <Link
                to="/clothing"
                className="inline-flex items-center gap-2 bg-theme-accent text-theme-accent-contrast px-7 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
