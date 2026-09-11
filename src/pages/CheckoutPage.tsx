import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ShippingAddress } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    discountAmount,
    couponCode,
    total,
    user,
    placeOrder
  } = useStore();

  const navigate = useNavigate();

  // If user has saved address, pre-fill
  const defaultAddr = user?.savedAddresses?.[0];

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: defaultAddr?.firstName || user?.firstName || '',
    lastName: defaultAddr?.lastName || user?.lastName || '',
    email: defaultAddr?.email || user?.email || '',
    phone: defaultAddr?.phone || user?.phone || '',
    addressLine1: defaultAddr?.addressLine1 || '',
    addressLine2: defaultAddr?.addressLine2 || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    postalCode: defaultAddr?.postalCode || '',
    country: defaultAddr?.country || 'India'
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'net_banking' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('sophia.laurent@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-theme-bg text-theme-text text-center px-4">
        <h1 className="text-2xl font-light tracking-tight">Your Bag is Empty</h1>
        <p className="text-xs text-theme-muted mt-2">Add items to your bag before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="mt-6 inline-block bg-theme-accent text-theme-surface px-6 py-3 text-xs font-semibold uppercase tracking-widest"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  const shippingCost = shippingMethod === 'express' ? 250 : (subtotal >= 2500 ? 0 : 150);
  const estimatedTax = Math.round(subtotal * 0.05); // 5% GST
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost + estimatedTax);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.firstName || !formData.email || !formData.addressLine1 || !formData.city || !formData.postalCode) {
      setErrorMessage('Please complete all required shipping fields.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    // Simulate secure payment processing
    setTimeout(() => {
      try {
        const newOrder = placeOrder({
          customer: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone
          },
          shippingAddress: formData,
          items: cart.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            primaryImage: item.product.primaryImage,
            color: item.selectedColor,
            size: item.selectedSize,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity
          })),
          subtotal,
          discount: discountAmount,
          shippingFee: shippingCost,
          estimatedTax: estimatedTax,
          total: finalTotal,
          status: 'placed',
          estimatedDelivery: shippingMethod === 'express' ? 'Delivering in 2 Business Days' : 'Delivering in 4-6 Business Days',
          paymentMethod: paymentMethod === 'card'
            ? 'Credit Card (•••• 4242)'
            : paymentMethod === 'upi'
            ? `UPI Instant (${upiId})`
            : paymentMethod === 'net_banking'
            ? 'Net Banking (HDFC / Axis / SBI)'
            : 'Cash on Delivery (COD)',
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
        });

        setIsProcessing(false);
        navigate(`/order-confirmation/${newOrder.orderNumber}`);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Payment or checkout failed. Please check your details.');
      }
    }, 1500);
  };

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Header */}
        <div className="flex items-center justify-between pb-6 border-b border-theme-border mb-10">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-text font-semibold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Bag</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-theme-muted font-light">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Checkout Steps */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Customer Contact */}
            <section className="bg-theme-surface border border-theme-border p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-theme-border pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-editorial text-theme-text">
                  1. Contact Information
                </h2>
                {!user && (
                  <span className="text-xs text-theme-muted">
                    Checking out as guest
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-theme-muted mb-1 font-medium">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Shipping Address */}
            <section className="bg-theme-surface border border-theme-border p-6 sm:p-8 space-y-4">
              <div className="border-b border-theme-border pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-editorial text-theme-text">
                  2. Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-theme-muted mb-1 font-medium">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1 font-medium">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-theme-muted mb-1 font-medium">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House number and street name"
                  value={formData.addressLine1}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="block text-xs text-theme-muted mb-1 font-medium">Apartment, Suite, Unit (Optional)</label>
                <input
                  type="text"
                  placeholder="Apt 4B"
                  value={formData.addressLine2}
                  onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-theme-muted mb-1 font-medium">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1 font-medium">State / Region *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs text-theme-muted mb-1 font-medium">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Delivery Options */}
            <section className="bg-theme-surface border border-theme-border p-6 sm:p-8 space-y-4">
              <div className="border-b border-theme-border pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-editorial text-theme-text">
                  3. Delivery Method
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <label
                  className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                    shippingMethod === 'standard'
                      ? 'border-theme-accent bg-theme-accent/5'
                      : 'border-theme-border hover:border-theme-accent/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-theme-accent"
                    />
                    <div>
                      <p className="font-semibold text-theme-text">Complimentary Standard Delivery</p>
                      <p className="text-theme-muted font-light text-[11px]">4 - 6 Business Days • Archival Gift Wrapped</p>
                    </div>
                  </div>
                  <span className="font-semibold text-theme-text">
                    {subtotal >= 2500 ? 'Free' : '₹150'}
                  </span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                    shippingMethod === 'express'
                      ? 'border-theme-accent bg-theme-accent/5'
                      : 'border-theme-border hover:border-theme-accent/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="accent-theme-accent"
                    />
                    <div>
                      <p className="font-semibold text-theme-text">Priority Express Courier</p>
                      <p className="text-theme-muted font-light text-[11px]">1 - 2 Business Days • Dedicated Signature Courier</p>
                    </div>
                  </div>
                  <span className="font-semibold text-theme-text">₹250</span>
                </label>
              </div>
            </section>

            {/* Step 4: Payment Method */}
            <section className="bg-theme-surface border border-theme-border p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-theme-border pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-editorial text-theme-text">
                  4. Payment Method
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <label
                  className={`flex items-center gap-3 p-4 border cursor-pointer text-xs ${
                    paymentMethod === 'upi'
                      ? 'border-theme-accent bg-theme-accent/5'
                      : 'border-theme-border hover:border-theme-accent/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="accent-theme-accent"
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs px-1.5 py-0.5 rounded bg-emerald-800 text-white">UPI</span>
                    <span className="font-semibold text-theme-text">UPI Instant (Google Pay, PhonePe, Paytm, BHIM)</span>
                  </div>
                </label>

                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-theme-bg border border-theme-border space-y-3 text-xs">
                    <div>
                      <label className="block text-theme-muted mb-1 font-medium">Your UPI ID / VPA</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-theme-text focus:outline-none focus:border-theme-accent font-mono"
                      />
                    </div>
                    <div className="p-3 bg-theme-surface border border-theme-border rounded text-[11px] text-theme-muted space-y-1">
                      <p className="font-semibold text-theme-text">Instant Payment Guarantee</p>
                      <p>You can also authorize via instant UPI Intent QR on your device upon clicking Complete Order.</p>
                    </div>
                  </div>
                )}

                {/* Card Option */}
                <label
                  className={`flex items-center gap-3 p-4 border cursor-pointer text-xs ${
                    paymentMethod === 'card'
                      ? 'border-theme-accent bg-theme-accent/5'
                      : 'border-theme-border hover:border-theme-accent/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-theme-accent"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-theme-accent" />
                    <span className="font-semibold text-theme-text">Credit or Debit Card (Visa, MasterCard, RuPay)</span>
                  </div>
                </label>

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-theme-bg border border-theme-border space-y-3 text-xs">
                    <div>
                      <label className="block text-theme-muted mb-1 font-medium">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-theme-text focus:outline-none focus:border-theme-accent font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-theme-muted mb-1 font-medium">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-theme-text focus:outline-none focus:border-theme-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-theme-muted mb-1 font-medium">Security Code</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          className="w-full bg-theme-surface border border-theme-border px-3 py-2 text-theme-text focus:outline-none focus:border-theme-accent font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking Option */}
                <label
                  className={`flex items-center gap-3 p-4 border cursor-pointer text-xs ${
                    paymentMethod === 'net_banking'
                      ? 'border-theme-accent bg-theme-accent/5'
                      : 'border-theme-border hover:border-theme-accent/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'net_banking'}
                    onChange={() => setPaymentMethod('net_banking')}
                    className="accent-theme-accent"
                  />
                  <span className="font-semibold text-theme-text">Net Banking (HDFC, ICICI, SBI, Axis, Kotak)</span>
                </label>

                {/* COD Option */}
                <label
                  className={`flex items-center gap-3 p-4 border cursor-pointer text-xs ${
                    paymentMethod === 'cod'
                      ? 'border-theme-accent bg-theme-accent/5'
                      : 'border-theme-border hover:border-theme-accent/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-theme-accent"
                  />
                  <span className="font-semibold text-theme-text">Cash on Delivery (Concierge Inspection)</span>
                </label>
              </div>
            </section>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-theme-accent text-theme-surface py-4 text-xs font-semibold uppercase tracking-widest hover:opacity-95 transition-opacity shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-theme-surface border-t-transparent rounded-full animate-spin" />
                  <span>Processing Secure Order...</span>
                </>
              ) : (
                <>
                  <span>Complete Order • ₹{finalTotal.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-theme-surface border border-theme-border p-6 sm:p-8 space-y-6 sticky top-28">
              <h3 className="text-xs uppercase tracking-editorial font-bold text-theme-text border-b border-theme-border pb-3">
                Order Items ({cart.length})
              </h3>

              {/* Items Reel */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 divide-y divide-theme-border">
                {cart.map(item => (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-14 h-18 object-cover bg-theme-surface-subtle flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-theme-text truncate">{item.product.name}</p>
                      <p className="text-[11px] text-theme-muted">{item.selectedColor} • {item.selectedSize}</p>
                      <p className="text-[11px] text-theme-muted font-medium">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-theme-text">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="border-t border-theme-border pt-4 space-y-2 text-xs font-light text-theme-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-theme-text">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Discount ({couponCode})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : `₹${shippingCost.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST 5%)</span>
                  <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-theme-text pt-3 border-t border-theme-border">
                  <span>Total Due</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
