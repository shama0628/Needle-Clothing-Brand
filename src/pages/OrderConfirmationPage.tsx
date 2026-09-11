import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Truck, Calendar, MapPin, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { orders } = useStore();

  const order = orders.find(o => o.orderNumber === orderNumber) || orders[0];

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#34232C', '#ECE5D9', '#BFAEA0', '#8C7E74']
      });
    } catch {
      // ignore
    }
  }, []);

  if (!order) {
    return (
      <div className="pt-32 min-h-screen text-center bg-theme-bg text-theme-text px-4">
        <h1 className="text-2xl font-light">Order Not Found</h1>
        <Link to="/" className="mt-4 inline-block text-xs uppercase tracking-wider underline text-theme-muted hover:text-theme-text">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Confirmation Hero */}
        <div className="bg-theme-surface border border-theme-border p-8 sm:p-12 text-center shadow-sm mb-10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-editorial text-theme-muted block mb-1">
            Payment Successful
          </span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text mb-2">
            Order Confirmed
          </h1>
          <p className="text-sm text-theme-muted font-light max-w-md mx-auto mb-4">
            Thank you for shopping with Needle. Your order has been registered in the atelier queue.
          </p>

          <div className="inline-block bg-theme-accent text-theme-accent-contrast px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            Order #{order.orderNumber}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-theme-border">
            <Link
              to="/account"
              className="w-full sm:w-auto bg-theme-accent text-theme-accent-contrast px-7 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md"
            >
              View Order in Account
            </Link>
            <Link
              to="/clothing"
              className="w-full sm:w-auto border border-theme-border text-theme-text px-7 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-theme-accent hover:text-theme-accent-contrast transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Purchased Items */}
          <div className="md:col-span-7 bg-theme-surface border border-theme-border p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-theme-border pb-4">
              <Package className="w-4 h-4 text-theme-text" />
              <h2 className="text-xs uppercase tracking-editorial font-bold text-theme-text">
                Items in this Order ({order.items.length})
              </h2>
            </div>

            <div className="space-y-4 divide-y divide-theme-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-4 first:pt-0 flex gap-4 items-center">
                  <img
                    src={item.primaryImage}
                    alt={item.productName}
                    className="w-16 h-20 object-cover bg-theme-surface-subtle flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-theme-text truncate">{item.productName}</h3>
                    <p className="text-[11px] text-theme-muted font-light mt-0.5">
                      Color: {item.color} • Size: {item.size}
                    </p>
                    <p className="text-[11px] text-theme-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-theme-text">
                    ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal table */}
            <div className="border-t border-theme-border pt-4 space-y-2 text-xs font-light text-theme-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{order.shippingFee === 0 ? 'Complimentary' : `₹${order.shippingFee.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-theme-text pt-2 border-t border-theme-border">
                <span>Total Paid</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Billing Summary */}
          <div className="md:col-span-5 space-y-6">
            {/* Delivery Timeline */}
            <div className="bg-theme-surface border border-theme-border p-6 space-y-3">
              <div className="flex items-center gap-2 text-theme-text">
                <Truck className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-editorial">
                  Delivery Status
                </h3>
              </div>
              <p className="text-xs font-medium text-theme-text capitalize">
                Status: <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{order.status}</span>
              </p>
              <div className="flex items-start gap-2 text-xs text-theme-muted font-light pt-1">
                <Calendar className="w-3.5 h-3.5 mt-0.5 text-theme-text" />
                <span>Estimated Arrival: <strong>{order.estimatedDelivery}</strong></span>
              </div>
            </div>

            {/* Shipping Address Snapshot */}
            <div className="bg-theme-surface border border-theme-border p-6 space-y-3">
              <div className="flex items-center gap-2 text-theme-text border-b border-theme-border pb-2">
                <MapPin className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-editorial">
                  Shipping Address
                </h3>
              </div>
              <div className="text-xs text-theme-muted font-light space-y-0.5">
                <p className="font-semibold text-theme-text">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-1 text-theme-muted/80">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Snapshot */}
            <div className="bg-theme-surface border border-theme-border p-6 space-y-2">
              <div className="flex items-center gap-2 text-theme-text border-b border-theme-border pb-2">
                <CreditCard className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-editorial">
                  Payment Details
                </h3>
              </div>
              <p className="text-xs text-theme-muted font-light">
                Method: <strong>{order.paymentMethod}</strong>
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Authorization: Approved (Status: {order.paymentStatus})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
