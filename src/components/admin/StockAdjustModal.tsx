import React, { useState } from 'react';
import { X, Boxes, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Product } from '../../types';
import { StockMovement } from '../../types/admin';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';

interface StockAdjustModalProps {
  product: Product;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ product, onClose }) => {
  const { recordStockMovement } = useAdmin();
  const { adjustProductStock } = useStore();

  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<StockMovement['reason']>('Restock shipment received');
  const [error, setError] = useState<string | null>(null);

  const delta = adjustmentType === 'add' ? quantity : -quantity;
  const projectedStock = Math.max(0, product.stockCount + delta);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Adjustment quantity must be greater than zero.');
      return;
    }

    if (adjustmentType === 'remove' && quantity > product.stockCount) {
      setError(`Cannot deduct ${quantity} units: current stock is only ${product.stockCount}.`);
      return;
    }

    adjustProductStock(product.id, delta);
    recordStockMovement(
      product.id,
      product.name,
      product.sku || `NDL-${product.id.toUpperCase()}`,
      delta,
      projectedStock,
      reason
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-sand shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-sand/40 flex items-center justify-between bg-sand/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-plum text-beige flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Adjust SKU Inventory</h3>
              <p className="text-[11px] text-charcoal/60 font-mono">{product.sku || 'NDL-PROD'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-sand/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Target Product Summary */}
          <div className="p-3.5 bg-sand/20 rounded-xl border border-sand/50 flex items-center gap-3">
            <img
              src={product.primaryImage}
              alt={product.name}
              className="w-12 h-14 object-cover rounded-lg shrink-0 border border-sand"
            />
            <div className="overflow-hidden min-w-0">
              <h4 className="text-xs font-semibold text-charcoal truncate">{product.name}</h4>
              <p className="text-[11px] text-charcoal/60 capitalize">{product.category} • {product.subcategory}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="text-charcoal/70">Current on-hand:</span>
                <span className={`font-bold ${product.stockCount <= 10 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {product.stockCount} units
                </span>
              </div>
            </div>
          </div>

          {/* Add vs Remove Toggle */}
          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Adjustment Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('add');
                  setReason('Restock shipment received');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustmentType === 'add'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-white text-charcoal/70 border-sand hover:bg-sand/20'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restock (+ Add)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('remove');
                  setReason('Damaged goods write-off');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustmentType === 'remove'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-200'
                    : 'bg-white text-charcoal/70 border-sand hover:bg-sand/20'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Deduct (- Remove)</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Quantity to {adjustmentType === 'add' ? 'Add' : 'Deduct'}
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={quantity}
              onChange={e => {
                setQuantity(Math.max(1, parseInt(e.target.value) || 0));
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
              required
            />
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Reason Code (Required for Audit Log)
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as StockMovement['reason'])}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
            >
              {adjustmentType === 'add' ? (
                <>
                  <option value="Restock shipment received">Restock shipment received</option>
                  <option value="Customer return restock">Customer return restock</option>
                  <option value="Inventory audit discrepancy">Inventory audit discrepancy</option>
                  <option value="Manual adjustment">Manual adjustment</option>
                </>
              ) : (
                <>
                  <option value="Damaged goods write-off">Damaged goods write-off</option>
                  <option value="Inventory audit discrepancy">Inventory audit discrepancy (Shrinkage)</option>
                  <option value="Order fulfillment">Manual fulfillment deduction</option>
                  <option value="Manual adjustment">Manual adjustment</option>
                </>
              )}
            </select>
          </div>

          {/* Projected Result Box */}
          <div className="p-3 bg-plum/5 rounded-lg border border-plum/10 flex items-center justify-between text-xs">
            <span className="text-charcoal/70">Resulting Stock Level:</span>
            <div className="flex items-center gap-1.5">
              <span className="line-through text-charcoal/40">{product.stockCount}</span>
              <span className="text-charcoal/60">→</span>
              <span className="font-bold text-plum text-sm">{projectedStock} units</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
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
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-beige bg-plum hover:bg-plum/90 rounded-lg transition-colors shadow-sm"
            >
              Confirm Stock Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
