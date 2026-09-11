import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Order } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';

interface RefundModalProps {
  order: Order;
  onClose: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ order, onClose }) => {
  const { currentAdmin, logAction } = useAdmin();
  const { processRefund } = useStore();

  const [refundAmount, setRefundAmount] = useState<number>(order.total);
  const [reason, setReason] = useState<string>('Customer requested cancellation');
  const [customNote, setCustomNote] = useState<string>('');
  const [restockItems, setRestockItems] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0) {
      setError('Refund amount must be greater than $0.00.');
      return;
    }

    if (refundAmount > order.total) {
      setError(`Refund cannot exceed the order grand total ($${order.total.toFixed(2)}).`);
      return;
    }

    const fullReason = customNote ? `${reason}: ${customNote}` : reason;
    const res = processRefund(order.id, refundAmount, fullReason, restockItems, currentAdmin?.name);

    if (res.success) {
      logAction(
        'refund',
        'Issued Customer Refund',
        `Processed refund of $${refundAmount.toFixed(2)} on Order ${order.orderNumber}. Reason: ${fullReason}. Restock: ${restockItems ? 'YES' : 'NO'}`,
        order.id,
        order.orderNumber,
        {
          before: { paymentStatus: order.paymentStatus, status: order.status },
          after: { paymentStatus: refundAmount >= order.total ? 'refunded' : 'partially_refunded', refundAmount }
        }
      );
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-sand shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand/40 flex items-center justify-between bg-sand/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Issue Refund / Cancel Order</h3>
              <p className="text-[11px] text-charcoal/60 font-mono">Order {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-sand/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Snapshot */}
          <div className="p-4 bg-sand/20 rounded-xl border border-sand/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal/70">Customer:</span>
              <span className="font-medium text-charcoal">{order.customer.name} ({order.customer.email})</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal/70">Payment Method:</span>
              <span className="font-mono text-charcoal">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-sand/40 pt-2">
              <span className="text-charcoal/70">Order Grand Total:</span>
              <span className="font-bold text-plum text-sm">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Refund Amount Input */}
          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Refund Amount ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-charcoal/40 text-sm font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={order.total}
                value={refundAmount}
                onChange={e => {
                  setRefundAmount(parseFloat(e.target.value) || 0);
                  setError(null);
                }}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-lg border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 font-semibold"
                required
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-charcoal/50">
              <button
                type="button"
                onClick={() => setRefundAmount(order.total)}
                className="hover:underline text-plum font-medium"
              >
                Set Full Refund (${order.total.toFixed(2)})
              </button>
              <span>Items in order: {order.items.length}</span>
            </div>
          </div>

          {/* Reason Code */}
          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Refund Reason (Audit Log Required)
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
            >
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Item returned in pristine condition">Item returned in pristine condition</option>
              <option value="Defective fabric or stitch reported">Defective fabric or stitch reported</option>
              <option value="Delivery delay concession">Delivery delay concession</option>
              <option value="Customer support goodwill">Customer support goodwill</option>
              <option value="Duplicate transaction error">Duplicate transaction error</option>
            </select>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Internal Case Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g. Return received via courier, inspected by atelier team..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 resize-none"
            />
          </div>

          {/* Restock Items Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
            <input
              type="checkbox"
              id="restock-checkbox"
              checked={restockItems}
              onChange={e => setRestockItems(e.target.checked)}
              className="w-4 h-4 rounded text-plum focus:ring-plum"
            />
            <label htmlFor="restock-checkbox" className="text-xs text-emerald-950 font-medium cursor-pointer">
              Automatically restock {order.items.reduce((acc, i) => acc + i.quantity, 0)} item(s) back into inventory
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-charcoal/70 hover:bg-sand/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Confirm Refund of ${refundAmount.toFixed(2)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
