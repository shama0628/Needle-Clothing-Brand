import React, { useState } from 'react';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  History,
  AlertTriangle,
  CheckCircle2,
  Package
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { Product } from '../../types';
import { StockAdjustModal } from '../../components/admin/StockAdjustModal';

export const AdminInventoryPage: React.FC = () => {
  const { products, orders } = useStore();
  const { stockMovements } = useAdmin();

  const [activeTab, setActiveTab] = useState<'control' | 'history'>('control');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Compute reserved stock from pending orders (orders in 'placed' or 'processing')
  const pendingOrders = orders.filter(o => o.status === 'placed' || o.status === 'processing');
  const reservedStockMap: Record<string, number> = {};
  pendingOrders.forEach(ord => {
    ord.items.forEach(item => {
      reservedStockMap[item.productId] = (reservedStockMap[item.productId] || 0) + item.quantity;
    });
  });

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.subcategory.toLowerCase().includes(q);

    let matchesLevel = true;
    if (stockLevelFilter === 'low') matchesLevel = p.stockCount > 0 && p.stockCount <= 10;
    else if (stockLevelFilter === 'out') matchesLevel = p.stockCount === 0;

    return matchesSearch && matchesLevel;
  });

  const lowStockCount = products.filter(p => p.stockCount <= 10 && p.stockCount > 0).length;
  const outOfStockCount = products.filter(p => p.stockCount === 0).length;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 8 • Centralized SKU reservations, stock adjustments and movement audit.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-sand/30 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('control')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'control'
                ? 'bg-plum text-beige shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>SKU Inventory Table</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-plum text-beige shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movement Audit Log ({stockMovements.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-sand/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal/60 font-medium">Total Tracked SKUs</span>
            <span className="text-2xl font-serif font-bold text-charcoal block mt-0.5">
              {products.length} Items
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sand/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-800 font-medium">Low Stock Warnings (≤ 10)</span>
            <span className="text-2xl font-serif font-bold text-amber-950 block mt-0.5">
              {lowStockCount} SKUs
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-sand/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-700 font-medium">Out of Stock (0 Units)</span>
            <span className="text-2xl font-serif font-bold text-rose-950 block mt-0.5">
              {outOfStockCount} SKUs
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {activeTab === 'control' ? (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-sand/60 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by SKU, product name, or subcategory..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-sand/10"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-charcoal/60">Stock Level:</span>
              <select
                value={stockLevelFilter}
                onChange={e => setStockLevelFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-sand/80 bg-white"
              >
                <option value="all">All Levels</option>
                <option value="low">Low Stock Only (≤ 10)</option>
                <option value="out">Out of Stock Only (0)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal">
                <thead className="bg-sand/20 text-charcoal/70 uppercase tracking-wider text-[10px] font-semibold border-b border-sand/40">
                  <tr>
                    <th className="py-3.5 px-4">Item & SKU</th>
                    <th className="py-3.5 px-3">On-Hand Total</th>
                    <th className="py-3.5 px-3">Reserved (Active Orders)</th>
                    <th className="py-3.5 px-3">Available to Sell</th>
                    <th className="py-3.5 px-3">Safety Threshold</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {filteredProducts.map(product => {
                    const reserved = reservedStockMap[product.id] || 0;
                    const available = Math.max(0, product.stockCount - reserved);
                    const isLow = product.stockCount > 0 && product.stockCount <= 10;
                    const isOut = product.stockCount === 0;

                    return (
                      <tr key={product.id} className="hover:bg-sand/10 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.primaryImage}
                              alt={product.name}
                              className="w-10 h-12 object-cover rounded-lg border border-sand shrink-0 shadow-xs"
                            />
                            <div>
                              <h4 className="font-semibold text-charcoal">{product.name}</h4>
                              <p className="text-[11px] text-charcoal/50 font-mono">
                                {product.sku || 'NDL-PROD'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-charcoal">
                          {product.stockCount} units
                        </td>

                        <td className="py-3.5 px-3 text-charcoal/70">
                          {reserved > 0 ? (
                            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold">
                              {reserved} reserved
                            </span>
                          ) : (
                            <span className="text-charcoal/40">0</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-bold text-plum">
                          {available} units
                        </td>

                        <td className="py-3.5 px-3 text-charcoal/50 font-mono">
                          10 units
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="px-3 py-1.5 bg-plum text-beige hover:bg-plum/90 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Movement History Log */
        <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-sand/40 bg-sand/10">
            <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider">
              Immutable Stock Movement Log (Doc 02 Section 8 & 15)
            </h3>
            <p className="text-[11px] text-charcoal/60 mt-0.5">
              Tracks all additions, order deductions, returns, write-offs and physical audit changes with author timestamps.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal">
              <thead className="bg-sand/20 text-charcoal/70 uppercase tracking-wider text-[10px] font-semibold border-b border-sand/40">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">SKU & Item</th>
                  <th className="py-3 px-3">Delta</th>
                  <th className="py-3 px-3">New Balance</th>
                  <th className="py-3 px-3">Reason Code</th>
                  <th className="py-3 px-4 text-right">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/30">
                {stockMovements.map(sm => (
                  <tr key={sm.id} className="hover:bg-sand/10 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-charcoal/60 font-mono text-[11px]">
                      {new Date(sm.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-charcoal block">{sm.productName}</span>
                      <span className="text-[10px] text-charcoal/50 font-mono">{sm.sku}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                          sm.quantityDelta > 0
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {sm.quantityDelta > 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{sm.quantityDelta > 0 ? `+${sm.quantityDelta}` : sm.quantityDelta}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-plum">
                      {sm.newQuantity} units
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-charcoal/80">
                      {sm.reason}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap text-charcoal/60 font-medium">
                      {sm.actorName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <StockAdjustModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
