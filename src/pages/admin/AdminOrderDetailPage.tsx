import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  CreditCard,
  User,
  FileText,
  AlertCircle,
  Calendar,
  Send,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { RefundModal } from '../../components/admin/RefundModal';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, addOrderNote, updateReturnStatus } = useStore();
  const { currentAdmin, logAction } = useAdmin();

  const order = orders.find(o => o.id === id);

  const [noteText, setNoteText] = useState('');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [carrier, setCarrier] = useState('DHL Express Priority');
  const [trackingNumber, setTrackingNumber] = useState('');

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-sand">
        <h2 className="text-base font-semibold text-charcoal mb-2">Order Not Found</h2>
        <p className="text-xs text-charcoal/60 mb-4">No order matching identifier "{id}".</p>
        <Link
          to="/admin/orders"
          className="text-xs font-semibold text-plum hover:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Queue</span>
        </Link>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addOrderNote(order.id, `${currentAdmin?.name}: ${noteText.trim()}`);
    logAction('order', 'Added Internal Note', `Appended note to Order ${order.orderNumber}`, order.id, order.orderNumber);
    setNoteText('');
  };

  const handleAdvanceStatus = (newStatus: any) => {
    if (newStatus === 'shipped') {
      setTrackingNumber(order.trackingNumber || `DHL-${Math.floor(100000000 + Math.random() * 900000000)}`);
      setTrackingModalOpen(true);
      return;
    }

    updateOrderStatus(order.id, newStatus, undefined, undefined, currentAdmin?.name);
    logAction('order', 'Order Status Transition', `Updated Order ${order.orderNumber} to ${newStatus.toUpperCase()}`, order.id, order.orderNumber);
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.id, 'shipped', trackingNumber, carrier, currentAdmin?.name);
    logAction('order', 'Order Dispatched', `Set tracking ${trackingNumber} on Order ${order.orderNumber}`, order.id, order.orderNumber);
    setTrackingModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl bg-sand/30 hover:bg-sand/60 text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-charcoal">
                Order {order.orderNumber}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
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
                    ? 'bg-sand/60 text-charcoal/60'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {order.status}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-800'
                    : order.paymentStatus === 'refunded' || order.paymentStatus === 'partially_refunded'
                    ? 'bg-rose-50 text-rose-800'
                    : 'bg-amber-50 text-amber-800'
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-charcoal/50 mt-0.5">
              Placed on {order.date} • ID: <code className="font-mono text-[11px]">{order.id}</code>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {order.status === 'placed' && (
            <button
              onClick={() => handleAdvanceStatus('confirmed')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Order</span>
            </button>
          )}

          {order.status === 'confirmed' && (
            <button
              onClick={() => handleAdvanceStatus('processing')}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Start Preparation</span>
            </button>
          )}

          {order.status === 'processing' && (
            <button
              onClick={() => handleAdvanceStatus('packed')}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Mark Packed</span>
            </button>
          )}

          {order.status === 'packed' && (
            <button
              onClick={() => handleAdvanceStatus('shipped')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch Order</span>
            </button>
          )}

          {order.status === 'shipped' && (
            <button
              onClick={() => handleAdvanceStatus('delivered')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Delivery</span>
            </button>
          )}

          {(order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded') && order.status !== 'cancelled' && (
            <button
              onClick={() => setRefundModalOpen(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Issue Refund</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items snapshot and Financial summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Immutable Snapshot */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-sand/40 bg-sand/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Purchased Items Snapshot (Doc 03 Section 7)
                </h3>
                <p className="text-[11px] text-charcoal/50">
                  Immutable record captured at time of checkout
                </p>
              </div>
              <span className="text-xs font-bold text-plum">{order.items.length} Product(s)</span>
            </div>

            <div className="divide-y divide-sand/30">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.primaryImage}
                      alt={item.productName}
                      className="w-14 h-18 object-cover rounded-xl border border-sand shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-charcoal text-xs truncate">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-charcoal/60">
                        <span>Color: <strong>{item.color}</strong></span>
                        <span>•</span>
                        <span>Size: <strong>{item.size}</strong></span>
                      </div>
                      <span className="text-[10px] text-charcoal/40 font-mono block mt-0.5">
                        {item.sku ? `SKU: ${item.sku}` : `Item Ref: ${item.productId}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs text-charcoal/70">
                      ${item.unitPrice.toFixed(2)} × {item.quantity}
                    </div>
                    <div className="text-sm font-bold font-serif text-plum mt-0.5">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals Breakdown */}
            <div className="p-6 bg-sand/20 border-t border-sand/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-charcoal/70">
                <span>Subtotal</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-700">
                  <span>Applied Promo Discount</span>
                  <span className="font-mono">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-charcoal/70">
                <span>Delivery & Handling</span>
                <span className="font-mono">
                  {order.shippingFee === 0 ? 'Complimentary' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-charcoal/70">
                <span>Estimated Sales Tax</span>
                <span className="font-mono">${order.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-plum border-t border-sand/60 pt-3">
                <span className="font-serif">Grand Total Paid</span>
                <span className="font-serif text-base">${order.total.toFixed(2)}</span>
              </div>

              {order.refundAmount && (
                <div className="flex items-center justify-between text-xs text-rose-700 pt-2 border-t border-rose-200">
                  <span>Refunded Amount ({order.refundReason})</span>
                  <span className="font-mono font-bold">-${order.refundAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Return Requests (Doc 03 Section 15 & 25) */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-sand/40 bg-sand/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-plum" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Customer Return Requests ({order.returnRequests?.length || 0})
                  </h3>
                  <p className="text-[11px] text-charcoal/50">
                    Doc 03 Section 15 — Inspect RMA reason, verify item condition, restock inventory
                  </p>
                </div>
              </div>
            </div>

            {(!order.returnRequests || order.returnRequests.length === 0) ? (
              <div className="p-6 text-center text-xs text-charcoal/40 italic">
                No return requests logged for this order.
              </div>
            ) : (
              <div className="divide-y divide-sand/30">
                {order.returnRequests.map((ret, idx) => (
                  <div key={idx} className="p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-plum">RMA #{ret.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-[11px] text-charcoal/50 ml-2">Filed: {new Date(ret.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ret.status === 'completed' || ret.status === 'received'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : ret.status === 'approved'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : ret.status === 'rejected'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        Status: {ret.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-sand/15 p-3.5 rounded-xl border border-sand/40">
                      <div>
                        <span className="text-charcoal/60">Reason:</span>{' '}
                        <strong className="text-charcoal capitalize">{ret.reason_code.replace('_', ' ')}</strong>
                      </div>
                      <div>
                        <span className="text-charcoal/60">Resolution:</span>{' '}
                        <strong className="text-charcoal capitalize">{ret.resolution}</strong>
                      </div>
                      {ret.customer_note && (
                        <div className="col-span-full">
                          <span className="text-charcoal/60">Customer Note:</span>{' '}
                          <span className="text-charcoal italic">"{ret.customer_note}"</span>
                        </div>
                      )}
                      <div>
                        <span className="text-charcoal/60">Restocked:</span>{' '}
                        <strong className="text-charcoal">{ret.restocked ? 'Yes (Returned to Stock)' : 'Pending Inspection'}</strong>
                      </div>
                    </div>

                    {/* Admin Actions for this Return */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {ret.status === 'requested' && (
                        <>
                          <button
                            onClick={async () => {
                              await updateReturnStatus(ret.id, 'approved', false, currentAdmin?.name);
                              logAction('order', 'Return Approved', `Approved return request ${ret.id} for Order ${order.orderNumber}`, order.id, order.orderNumber);
                            }}
                            className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Approve Return
                          </button>
                          <button
                            onClick={async () => {
                              await updateReturnStatus(ret.id, 'rejected', false, currentAdmin?.name);
                              logAction('order', 'Return Rejected', `Rejected return request ${ret.id} for Order ${order.orderNumber}`, order.id, order.orderNumber);
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Reject Return
                          </button>
                        </>
                      )}

                      {ret.status === 'approved' && (
                        <>
                          <button
                            onClick={async () => {
                              await updateReturnStatus(ret.id, 'in_transit', false, currentAdmin?.name);
                              logAction('order', 'Return In Transit', `Marked return ${ret.id} as In Transit by courier`, order.id, order.orderNumber);
                            }}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Mark In Transit (Dispatched)
                          </button>
                          <button
                            onClick={async () => {
                              await updateReturnStatus(ret.id, 'received', false, currentAdmin?.name);
                              logAction('order', 'Return Received at Warehouse', `Marked return ${ret.id} received at warehouse`, order.id, order.orderNumber);
                            }}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Mark Received at Warehouse
                          </button>
                        </>
                      )}

                      {ret.status === 'in_transit' && (
                        <button
                          onClick={async () => {
                            await updateReturnStatus(ret.id, 'received', false, currentAdmin?.name);
                            logAction('order', 'Return Received at Warehouse', `Marked return ${ret.id} received at warehouse`, order.id, order.orderNumber);
                          }}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          Mark Received at Warehouse
                        </button>
                      )}

                      {ret.status === 'received' && (
                        <>
                          <button
                            onClick={async () => {
                              await updateReturnStatus(ret.id, 'inspected', true, currentAdmin?.name);
                              logAction('order', 'Return Inspected (Resellable)', `Inspected return ${ret.id}: pristine condition, restocked inventory`, order.id, order.orderNumber);
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Pass Inspection (Resellable & Restock)
                          </button>
                          <button
                            onClick={async () => {
                              await updateReturnStatus(ret.id, 'inspected', false, currentAdmin?.name);
                              logAction('order', 'Return Inspected (Damaged)', `Inspected return ${ret.id}: damaged goods, no restock`, order.id, order.orderNumber);
                            }}
                            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Fail Inspection (Damaged / No Restock)
                          </button>
                        </>
                      )}

                      {ret.status === 'inspected' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRefundModalOpen(true)}
                            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Issue Refund & Complete</span>
                          </button>
                          <button
                            onClick={async () => {
                              await updateReturnStatus(ret.id, 'completed', false, currentAdmin?.name);
                              logAction('order', 'Return Completed', `Finalized return RMA ${ret.id} as completed`, order.id, order.orderNumber);
                            }}
                            className="px-3.5 py-1.5 bg-plum text-beige rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            Mark RMA Completed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auditable Refunds Log (Doc 03 Section 16 & 21) */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-sand/40 bg-sand/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Auditable Refunds Ledger (REFUND records)
                </h3>
                <p className="text-[11px] text-charcoal/50">
                  Doc 03 Section 16 & 21 Invariant: Original grand total ($${order.total.toFixed(2)}) is immutable
                </p>
              </div>
              <span className="text-xs font-bold text-rose-700 font-mono">
                {order.refundRecords?.length || 0} Record(s)
              </span>
            </div>

            {(!order.refundRecords || order.refundRecords.length === 0) ? (
              <div className="p-6 text-center text-xs text-charcoal/40 italic">
                No refund records registered for this order.
              </div>
            ) : (
              <div className="divide-y divide-sand/30">
                {order.refundRecords.map((ref, idx) => (
                  <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-plum">{ref.id}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ref.status}
                        </span>
                        <span className="text-[11px] text-charcoal/50">
                          Provider Ref: <code className="font-mono">{ref.provider_refund_id}</code>
                        </span>
                      </div>
                      <p className="text-charcoal/80">
                        Reason: <strong>{ref.reason}</strong>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-charcoal/50">
                        <span>Date: {new Date(ref.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>Operator: <strong>{ref.requested_by}</strong></span>
                        <span>•</span>
                        <span>Inventory Restocked: <strong>{ref.restocked ? 'Yes' : 'No'}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-serif text-rose-700">
                        -${(ref.amount / 100).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-charcoal/50 block font-mono">USD</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronological Event History (Doc 03 Section 2 & 11) */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-plum" />
              <span>Order Lifecycle Audit Trail (ORDER_EVENT)</span>
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand/60">
              {order.orderEvents?.map((evt, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-7 text-xs">
                  <span className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-plum ring-4 ring-white" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal">{evt.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-charcoal/50 mt-0.5">
                      <span>{new Date(evt.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>Actor: <strong className="text-charcoal/70">{evt.actor}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Customer, Shipping Address, Payment & Internal Notes */}
        <div className="space-y-6">
          {/* Customer Profile Snapshot */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal pb-2 border-b border-sand/40">
              <User className="w-4 h-4 text-plum" />
              <span>Customer Snapshot</span>
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal">{order.customer.name}</p>
              <p className="text-xs text-charcoal/70">{order.customer.email}</p>
              <p className="text-xs text-charcoal/70">{order.customer.phone}</p>
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal pb-2 border-b border-sand/40">
              <MapPin className="w-4 h-4 text-plum" />
              <span>Delivery Address Snapshot</span>
            </div>
            <div className="text-xs text-charcoal/80 leading-relaxed">
              <p className="font-semibold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
            {order.trackingNumber && (
              <div className="pt-2 border-t border-sand/40">
                <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Carrier & Tracking</span>
                <span className="text-xs font-mono font-bold text-plum">{order.carrier || 'DHL'} — {order.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Payment Snapshot */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal pb-2 border-b border-sand/40">
              <CreditCard className="w-4 h-4 text-plum" />
              <span>Payment Provider Record</span>
            </div>
            <div className="text-xs text-charcoal/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-charcoal/60">Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal/60">Status:</span>
                <span className="font-bold uppercase text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal/60">PCI Scope:</span>
                <span className="text-[10px] text-charcoal/50">Tokenized / Compliant</span>
              </div>
            </div>
          </div>

          {/* Internal Atelier Notes */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal pb-2 border-b border-sand/40">
              <FileText className="w-4 h-4 text-plum" />
              <span>Internal Case Notes</span>
            </div>

            {order.internalNotes ? (
              <div className="p-3 bg-sand/20 rounded-xl text-xs text-charcoal/80 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {order.internalNotes}
              </div>
            ) : (
              <p className="text-xs text-charcoal/40 italic">No notes recorded yet.</p>
            )}

            <form onSubmit={handleAddNote} className="space-y-2 pt-2">
              <textarea
                rows={2}
                placeholder="Log internal customer service note..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
              />
              <button
                type="submit"
                className="w-full py-2 bg-sand/40 hover:bg-sand/70 text-charcoal text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note to Order</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-sand shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-charcoal">Dispatch Order & Assign Tracking</h3>
            <form onSubmit={handleSaveTracking} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">Carrier</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">Tracking Reference</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-plum rounded-lg border border-sand/80"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-charcoal/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && (
        <RefundModal
          order={order}
          onClose={() => setRefundModalOpen(false)}
        />
      )}
    </div>
  );
};
