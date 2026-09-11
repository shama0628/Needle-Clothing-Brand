import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    toggleWishlist,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    freeShippingRemaining,
    freeShippingThreshold,
    couponCode,
    applyCoupon,
    removeCoupon
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoError(null);
      setPromoInput('');
    }
  };

  const handleMoveToWishlist = (productId: string, cartItemId: string) => {
    toggleWishlist(productId);
    removeFromCart(cartItemId);
  };

  const freeShippingPercent = Math.min(
    100,
    Math.round(((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100)
  );

  const recommendations = PRODUCTS.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-theme-text mb-8">
          Shopping Bag ({cart.length})
        </h1>

        {cart.length === 0 ? (
          <div className="bg-theme-surface border border-theme-border p-12 sm:p-20 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-theme-accent/10 mx-auto flex items-center justify-center text-theme-accent">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-light tracking-tight text-theme-text">
              Your bag is empty.
            </h2>
            <p className="text-xs text-theme-muted font-light max-w-sm mx-auto leading-relaxed">
              Discover something made for your story. Explore our handcrafted modest dresses, luxury modal hijabs, and curated hardware.
            </p>
            <div className="pt-4">
              <Link
                to="/clothing"
                className="inline-flex items-center gap-2 bg-theme-accent text-theme-accent-contrast px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Bag Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Alert */}
              <div className="p-4 bg-theme-surface-secondary border border-theme-border text-xs font-light">
                {freeShippingRemaining > 0 ? (
                  <p className="text-theme-muted">
                    Add <strong className="font-semibold text-theme-text">₹{freeShippingRemaining.toLocaleString('en-IN')}</strong> more to qualify for <strong className="font-semibold text-theme-text">Complimentary Express Shipping</strong>.
                  </p>
                ) : (
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    You qualify for Complimentary Express Delivery!
                  </p>
                )}
                <div className="w-full bg-theme-surface-subtle h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-theme-accent h-full transition-all duration-300"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="divide-y divide-theme-border border-y border-theme-border">
                {cart.map(item => (
                  <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 items-start">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="w-24 sm:w-28 aspect-[3/4] bg-theme-surface-subtle overflow-hidden flex-shrink-0 block"
                    >
                      <img
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between w-full h-full">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="text-base font-light text-theme-text hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <span className="text-sm font-semibold text-theme-text">
                            ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <p className="text-xs text-theme-muted font-light mt-1">
                          {item.product.subtitle}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-theme-muted mt-2 font-light">
                          <span>Color: <strong className="font-medium text-theme-text">{item.selectedColor}</strong></span>
                          <span>•</span>
                          <span>Size: <strong className="font-medium text-theme-text">{item.selectedSize}</strong></span>
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-theme-border/50">
                        <div className="flex items-center gap-4">
                          {/* Stepper */}
                          <div className="flex items-center border border-theme-border bg-theme-surface">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-3 py-1.5 text-theme-text hover:bg-theme-accent/10 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-theme-text">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-3 py-1.5 text-theme-text hover:bg-theme-accent/10 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Move to Wishlist */}
                          <button
                            onClick={() => handleMoveToWishlist(item.product.id, item.id)}
                            className="text-xs text-theme-muted hover:text-theme-text flex items-center gap-1 transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>Save for later</span>
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-theme-muted hover:text-theme-text transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-4">
              <div className="bg-theme-surface border border-theme-border p-6 sm:p-8 space-y-6 sticky top-24 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-editorial text-theme-text border-b border-theme-border pb-4">
                  Order Summary
                </h2>

                {/* Promo Code Form */}
                {couponCode ? (
                  <div className="flex items-center justify-between bg-theme-accent text-theme-accent-contrast px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code: {couponCode} Applied</span>
                    </div>
                    <button onClick={removeCoupon} className="underline text-[11px]">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code (e.g. NEEDLE10)"
                        value={promoInput}
                        onChange={e => {
                          setPromoInput(e.target.value);
                          setPromoError(null);
                        }}
                        className="flex-1 bg-theme-bg border border-theme-border px-3 py-2 text-xs uppercase tracking-wider text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-text"
                      />
                      <button
                        type="submit"
                        className="bg-theme-accent text-theme-accent-contrast px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 font-light">{promoError}</p>
                    )}
                  </form>
                )}

                {/* Costs Breakdown */}
                <div className="space-y-2 text-xs font-light text-theme-muted border-b border-theme-border pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-theme-text">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>{shippingFee === 0 ? 'Complimentary' : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between text-base font-semibold text-theme-text">
                  <span>Estimated Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-theme-accent text-theme-accent-contrast py-4 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[11px] text-theme-muted text-center font-light leading-relaxed">
                  Complimentary carbon-neutral express delivery & 14-day archival returns.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* You May Also Like */}
        <section className="mt-24 pt-16 border-t border-theme-border">
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-theme-text mb-8">
            Complete Your Atelier Wardrobe
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
