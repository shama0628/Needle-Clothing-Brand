import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Truck,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { Order, OrderStatus } from '../../types';
import { RefundModal } from '../../components/admin/RefundModal';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const { currentAdmin, logAction } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [returnFilter, setReturnFilter] = useState<string>('all');

  // Tracking modal state for transitioning to "shipped"
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState('DHL Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Refund modal state
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      o.customer.phone.toLowerCase().includes(q) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
      o.items.some(item =>
        item.productName.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q))
      );

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
    const matchesReturn =
      returnFilter === 'all' ||
      (returnFilter === 'with_returns' && o.returnRequests && o.returnRequests.length > 0) ||
      (returnFilter === 'pending_returns' && o.returnRequests && o.returnRequests.some(r => r.status === 'requested'));

    return matchesSearch && matchesStatus && matchesPayment && matchesReturn;
  });

  const handleQuickStatusAdvance = (order: Order) => {
    if (order.status === 'placed') {
      updateOrderStatus(order.id, 'confirmed', undefined, undefined, currentAdmin?.name);
      logAction('order', 'Order Confirmed', `Confirmed Order ${order.orderNumber}.`, order.id, order.orderNumber);
    } else if (order.status === 'confirmed') {
      updateOrderStatus(order.id, 'processing', undefined, undefined, currentAdmin?.name);
      logAction('order', 'Order Processing', `Moved Order ${order.orderNumber} to PROCESSING.`, order.id, order.orderNumber);
    } else if (order.status === 'processing') {
      updateOrderStatus(order.id, 'packed', undefined, undefined, currentAdmin?.name);
      logAction('order', 'Order Packed', `Marked Order ${order.orderNumber} as PACKED.`, order.id, order.orderNumber);
    } else if (order.status === 'packed') {
      setTrackingNumber(`DHL-${Math.floor(100000000 + Math.random() * 900000000)}`);
      setTrackingModalOrder(order);
    } else if (order.status === 'shipped') {
      updateOrderStatus(order.id, 'delivered', undefined, undefined, currentAdmin?.name);
      logAction('order', 'Order Marked Delivered', `Confirmed delivery for Order ${order.orderNumber}.`, order.id, order.orderNumber);
    }
  };

  const handleConfirmShipped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;

    updateOrderStatus(trackingModalOrder.id, 'shipped', trackingNumber, carrier, currentAdmin?.name);
    logAction(
      'order',
      'Order Dispatched / Shipped',
      `Shipped Order ${trackingModalOrder.orderNumber} via ${carrier} (Tracking: ${trackingNumber})`,
      trackingModalOrder.id,
      trackingModalOrder.orderNumber
    );

    setTrackingModalOrder(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Order Management & Fulfillment
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 12 & Document 03 • Real-time queue, state transitions and refunds.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-plum/10 text-plum">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-sand/60 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by order # (e.g. ND4819), customer name, email, phone or item..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-sand/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Fulfillment Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-sand/80 bg-white"
          >
            <option value="all">All Lifecycle States</option>
            <option value="placed">Placed (New)</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped / In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-sand/80 bg-white"
          >
            <option value="all">All Payment States</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partially_refunded">Partially Refunded</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Return Status Filter */}
          <select
            value={returnFilter}
            onChange={e => setReturnFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-sand/80 bg-white"
          >
            <option value="all">All Returns</option>
            <option value="with_returns">Has Return Requests</option>
            <option value="pending_returns">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal">
            <thead className="bg-sand/20 text-charcoal/70 uppercase tracking-wider text-[10px] font-semibold border-b border-sand/40">
              <tr>
                <th className="py-3.5 px-4">Order # & Date</th>
                <th className="py-3.5 px-3">Customer Profile</th>
                <th className="py-3.5 px-3">Items Ordered</th>
                <th className="py-3.5 px-3">Grand Total</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {filteredOrders.map(order => {
                return (
                  <tr key={order.id} className="hover:bg-sand/10 transition-colors group">
                    {/* Order # */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-mono font-bold text-plum hover:underline block text-xs"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="text-[10px] text-charcoal/50 block">{order.date}</span>
                      {order.returnRequests && order.returnRequests.length > 0 && (
                        <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          order.returnRequests.some(r => r.status === 'requested')
                            ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                            : 'bg-sand/40 text-charcoal/70 border-sand/60'
                        }`}>
                          Return: {order.returnRequests[0].status}
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-charcoal block truncate max-w-[140px]">
                        {order.customer.name}
                      </span>
                      <span className="text-[11px] text-charcoal/50 block truncate max-w-[140px]">
                        {order.customer.email}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.items.slice(0, 3).map((it, idx) => (
                            <img
                              key={idx}
                              src={it.primaryImage}
                              alt={it.productName}
                              className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-charcoal/70 whitespace-nowrap font-medium">
                          {order.items.length} item(s)
                        </span>
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-bold text-charcoal font-serif">
                      ${order.total.toFixed(2)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : order.paymentStatus === 'refunded' || order.paymentStatus === 'partially_refunded'
                            ? 'bg-rose-50 text-rose-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : order.status === 'shipped'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : order.status === 'packed'
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            : order.status === 'processing'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : order.status === 'confirmed'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : order.status === 'cancelled'
                            ? 'bg-sand/60 text-charcoal/50'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.trackingNumber && (
                        <span className="text-[9px] text-charcoal/50 font-mono block mt-0.5">
                          {order.trackingNumber}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status transition shortcut button */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleQuickStatusAdvance(order)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-plum bg-sand/30 hover:bg-sand/70 rounded-lg transition-colors flex items-center gap-1"
                            title="Advance order to next state"
                          >
                            <span>
                              {order.status === 'placed'
                                ? 'Confirm'
                                : order.status === 'confirmed'
                                ? 'Start Prep'
                                : order.status === 'processing'
                                ? 'Mark Packed'
                                : order.status === 'packed'
                                ? 'Ship'
                                : 'Mark Delivered'}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}

                        {/* Refund trigger */}
                        {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => setRefundOrder(order)}
                            title="Issue refund"
                            className="p-1.5 text-charcoal/50 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-1.5 text-charcoal/60 hover:text-plum hover:bg-sand/30 rounded-lg transition-colors flex items-center"
                          title="Inspect complete order snapshots"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carrier & Tracking Number Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-sand shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand/40">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-semibold text-charcoal">Dispatch & Assign Tracking</h3>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="text-charcoal/40 hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmShipped} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Logistics Carrier
                </label>
                <select
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                >
                  <option value="DHL Express">DHL Express Priority</option>
                  <option value="FedEx Priority">FedEx International Priority</option>
                  <option value="Aramex Modest Express">Aramex Modest Express</option>
                  <option value="UPS Worldwide">UPS Worldwide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Airway Bill / Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-sand/80 bg-white font-bold text-plum"
                  required
                />
              </div>

              <div className="p-3 bg-sand/20 rounded-xl text-[11px] text-charcoal/70 leading-relaxed">
                Saving will mark Order <strong>{trackingModalOrder.orderNumber}</strong> as <strong>SHIPPED</strong> and display tracking details in the customer's account portal.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 text-xs text-charcoal/60 hover:bg-sand/30 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-beige bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm"
                >
                  Confirm Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
        />
      )}
    </div>
  );
};
