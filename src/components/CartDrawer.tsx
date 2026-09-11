import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Tag, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    removeFromCart,
    updateQuantity,
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
  const [couponError, setCouponError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cartDrawerOpen) {
        setCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartDrawerOpen, setCartDrawerOpen]);

  if (!cartDrawerOpen) return null;

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError(null);
      setPromoInput('');
    }
  };

  const freeShippingProgress = Math.min(
    100,
    Math.round(((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Content */}
      <div className="relative w-full max-w-md bg-theme-surface text-theme-text h-full shadow-2xl flex flex-col z-10 overflow-hidden border-l border-theme-border">
        {/* Drawer Header */}
        <div className="p-5 border-b border-theme-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-theme-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-editorial">
              Your Bag ({cart.length})
            </h2>
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
            className="p-1.5 rounded-full hover:bg-theme-accent/10 text-theme-muted hover:text-theme-text transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-theme-surface-subtle px-5 py-3 border-b border-theme-border text-xs font-light">
          {freeShippingRemaining > 0 ? (
            <p className="text-theme-muted">
              Add <span className="font-semibold text-theme-text">₹{freeShippingRemaining.toLocaleString('en-IN')}</span> more to enjoy <span className="font-semibold text-theme-text">Complimentary Express Shipping</span>.
            </p>
          ) : (
            <p className="text-theme-text font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              You qualify for Complimentary Express Shipping!
            </p>
          )}
          <div className="w-full bg-theme-border h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-theme-accent h-full transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-theme-accent/5 flex items-center justify-center mb-4 text-theme-muted">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-theme-text tracking-tight">
              Your bag is empty.
            </h3>
            <p className="text-xs text-theme-muted font-light mt-1 max-w-xs leading-relaxed">
              Discover something made for your story. Curated silhouettes crafted for timeless modesty.
            </p>
            <button
              onClick={() => {
                setCartDrawerOpen(false);
                navigate('/clothing');
              }}
              className="mt-6 inline-flex items-center gap-2 bg-theme-accent text-theme-accent-contrast px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-theme-border">
              {cart.map(item => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-20 h-24 flex-shrink-0 bg-theme-surface-subtle overflow-hidden block border border-theme-border"
                  >
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={() => setCartDrawerOpen(false)}
                          className="text-xs font-semibold text-theme-text hover:underline line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-theme-muted hover:text-theme-text transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-theme-muted mt-0.5">
                        Color: <span className="font-medium text-theme-text">{item.selectedColor}</span>
                      </p>
                      <p className="text-[11px] text-theme-muted">
                        Size: <span className="font-medium text-theme-text">{item.selectedSize}</span>
                      </p>
                    </div>

                    {/* Stepper and Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-theme-border bg-theme-surface-subtle">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 hover:bg-theme-accent/10 text-theme-text transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-theme-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 hover:bg-theme-accent/10 text-theme-text transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-theme-text">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer Summary */}
            <div className="p-5 bg-theme-surface-subtle border-t border-theme-border space-y-3.5">
              {/* Promo Code Input */}
              {couponCode ? (
                <div className="flex items-center justify-between bg-theme-surface border border-theme-border px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-theme-text font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Promo Applied: {couponCode}</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-theme-muted hover:text-theme-text underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCode} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. NEEDLE10)"
                    value={promoInput}
                    onChange={e => {
                      setPromoInput(e.target.value);
                      setCouponError(null);
                    }}
                    className="flex-1 text-xs px-3 py-2 bg-theme-surface border border-theme-border placeholder:text-theme-muted/50 text-theme-text focus:outline-none focus:border-theme-accent uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="bg-theme-surface border border-theme-border hover:bg-theme-accent hover:text-theme-accent-contrast text-theme-text text-xs px-3 py-2 uppercase tracking-wider font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-500 font-light">{couponError}</p>
              )}

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-theme-muted font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-theme-text">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>{shippingFee === 0 ? 'Complimentary' : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-theme-border text-sm font-semibold text-theme-text">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-theme-accent text-theme-accent-contrast py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full bg-transparent border border-theme-border text-theme-text py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-theme-accent/5 transition-colors"
                >
                  View Full Bag
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
