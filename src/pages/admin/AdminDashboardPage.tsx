import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Boxes,
  Layers,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { StockAdjustModal } from '../../components/admin/StockAdjustModal';
import { ProductModal } from '../../components/admin/ProductModal';
import { Product } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { products, orders, cmsData } = useStore();
  const { currentAdmin, auditLogs } = useAdmin();

  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState<'7D' | '30D' | 'ALL'>('7D');

  // Operational Metrics
  const totalSales = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.total, 0);

  const totalDiscounts = orders.reduce((acc, o) => acc + o.discount, 0);
  const aov = orders.length > 0 ? totalSales / orders.length : 0;

  // Order breakdown
  const placedCount = orders.filter(o => o.status === 'placed').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  // Product Catalogue counts
  const publishedProducts = products.filter(p => p.status === 'published');
  const draftProducts = products.filter(p => p.status === 'draft');
  const archivedProducts = products.filter(p => p.status === 'archived');

  // Low Stock (< 10 units)
  const lowStockSkus = products
    .filter(p => p.stockCount <= 10 && p.status !== 'archived')
    .slice(0, 5);

  // Mock revenue curve data for SVG chart
  const revenueTrend = [
    { day: 'Mon', revenue: 420, orders: 3 },
    { day: 'Tue', revenue: 680, orders: 5 },
    { day: 'Wed', revenue: 540, orders: 4 },
    { day: 'Thu', revenue: 920, orders: 7 },
    { day: 'Fri', revenue: 1140, orders: 9 },
    { day: 'Sat', revenue: 1450, orders: 12 },
    { day: 'Sun', revenue: totalSales > 0 ? totalSales : 1280, orders: orders.length || 10 }
  ];

  const maxRev = Math.max(...revenueTrend.map(r => r.revenue), 1500);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Top Banner & Quick Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-plum text-beige p-6 rounded-2xl shadow-sm border border-plum/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-editorial text-amber-300">
              Operations Dashboard
            </span>
            <span className="text-xs text-beige/50">•</span>
            <span className="text-xs text-beige/80">Atelier Live Status</span>
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-beige font-light">
            Welcome, {currentAdmin?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-beige/70 mt-1 max-w-xl">
            Store operations are active. Review pending order queue, inventory alerts, and live hero merchandising.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setProductModalOpen(true)}
            className="bg-beige text-plum hover:bg-beige/90 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <Link
            to="/admin/cms"
            className="bg-white/10 hover:bg-white/20 text-beige px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Edit Homepage CMS</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-sand/60 shadow-xs">
          <div className="flex items-center justify-between text-charcoal/60 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif text-charcoal font-semibold mb-1">
            ${totalSales.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last week</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-sand/60 shadow-xs">
          <div className="flex items-center justify-between text-charcoal/60 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-plum/10 text-plum flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif text-charcoal font-semibold mb-1">
            {orders.length} orders
          </div>
          <div className="text-xs text-charcoal/60">
            {placedCount} pending confirmation
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-sand/60 shadow-xs">
          <div className="flex items-center justify-between text-charcoal/60 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif text-charcoal font-semibold mb-1">
            ${aov.toFixed(2)}
          </div>
          <div className="text-xs text-charcoal/60">
            Discounts: ${totalDiscounts.toFixed(2)}
          </div>
        </div>

        {/* Low Stock SKUs */}
        <div className="bg-white p-5 rounded-2xl border border-sand/60 shadow-xs">
          <div className="flex items-center justify-between text-charcoal/60 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Inventory Health</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif text-charcoal font-semibold mb-1">
            {lowStockSkus.length} SKUs Low
          </div>
          <Link
            to="/admin/inventory"
            className="text-xs text-rose-600 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Resolve stock shortage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Order Status Pipeline Flow */}
      <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Fulfillment Pipeline</h3>
            <p className="text-xs text-charcoal/60">Document 03 Operational Order States</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-plum hover:underline flex items-center gap-1"
          >
            <span>Open Order Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center justify-between text-xs text-amber-900 font-semibold mb-1">
              <span>New / Placed</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-serif font-bold text-amber-950 block">
              {placedCount}
            </span>
            <span className="text-[11px] text-amber-800">Awaiting preparation</span>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex items-center justify-between text-xs text-sky-900 font-semibold mb-1">
              <span>Processing</span>
              <Boxes className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl font-serif font-bold text-sky-950 block">
              {processingCount}
            </span>
            <span className="text-[11px] text-sky-800">In atelier packing</span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80">
            <div className="flex items-center justify-between text-xs text-purple-900 font-semibold mb-1">
              <span>In Transit / Shipped</span>
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-serif font-bold text-purple-950 block">
              {shippedCount}
            </span>
            <span className="text-[11px] text-purple-800">Tracking assigned</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold mb-1">
              <span>Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-serif font-bold text-emerald-950 block">
              {deliveredCount}
            </span>
            <span className="text-[11px] text-emerald-800">Completed cycles</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Revenue Chart & Catalogue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Interactive SVG Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-sand/60 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Revenue & Performance Trend</h3>
              <p className="text-xs text-charcoal/60">Gross order revenue by day</p>
            </div>
            <div className="flex items-center gap-1 bg-sand/30 p-1 rounded-lg text-xs font-semibold">
              {(['7D', '30D', 'ALL'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSalesTimeframe(t)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    salesTimeframe === t ? 'bg-plum text-beige shadow-xs' : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sleek SVG Bar & Curve Visualizer */}
          <div className="h-56 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {revenueTrend.map((item, idx) => {
              const heightPercent = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-plum bg-sand/60 px-1.5 py-0.5 rounded">
                    ${item.revenue}
                  </div>
                  <div className="w-full max-w-[42px] bg-sand/40 hover:bg-plum/80 rounded-t-lg transition-all relative overflow-hidden flex items-end">
                    <div
                      className="w-full bg-plum/70 group-hover:bg-plum rounded-t-lg transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-charcoal/60">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-sand/40 flex items-center justify-between text-xs text-charcoal/60">
            <span>Peak Daily Sales: ${maxRev.toFixed(2)}</span>
            <span className="text-emerald-700 font-medium">98.4% Fulfillment Success Rate</span>
          </div>
        </div>

        {/* Catalogue Status & CMS Summary */}
        <div className="space-y-6">
          {/* Catalogue Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs">
            <h3 className="text-sm font-semibold text-charcoal mb-4">Catalogue Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-emerald-950">Published & Live</span>
                </div>
                <span className="font-bold text-emerald-900">{publishedProducts.length} items</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-amber-950">Draft / Staging</span>
                </div>
                <span className="font-bold text-amber-900">{draftProducts.length} items</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-sand/30 border border-sand/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-charcoal/40" />
                  <span className="font-medium text-charcoal/80">Archived Records</span>
                </div>
                <span className="font-bold text-charcoal/70">{archivedProducts.length} items</span>
              </div>
            </div>

            <Link
              to="/admin/products"
              className="mt-4 w-full block text-center py-2 text-xs font-semibold text-plum bg-sand/30 hover:bg-sand/60 rounded-lg transition-colors"
            >
              Manage Complete Catalogue
            </Link>
          </div>

          {/* Active Homepage Campaign Widget */}
          <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-charcoal">Active Hero Campaign</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live
              </span>
            </div>
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 border border-sand">
              <img
                src={cmsData.hero.desktopImage}
                alt="Active hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs text-beige font-serif font-light">{cmsData.hero.title}</span>
              </div>
            </div>
            <p className="text-[11px] text-charcoal/70 leading-relaxed mb-3">
              Destination: <code className="font-mono text-plum">{cmsData.hero.ctaLink}</code>
            </p>
            <Link
              to="/admin/cms"
              className="w-full block text-center py-2 text-xs font-semibold text-plum bg-plum/10 hover:bg-plum/20 rounded-lg transition-colors"
            >
              Update Hero Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Column: Low Stock Alerts & Recent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock SKU Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Low Stock SKU Warnings</h3>
              <p className="text-xs text-charcoal/60">Inventory below safety threshold (≤ 10 units)</p>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs font-semibold text-plum hover:underline flex items-center gap-1"
            >
              <span>All Stock</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {lowStockSkus.length === 0 ? (
            <div className="p-8 text-center text-charcoal/50 text-xs">
              All active product SKUs have healthy inventory levels.
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockSkus.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-sand/20 border border-sand/50 hover:bg-sand/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.primaryImage}
                      alt={item.name}
                      className="w-10 h-12 object-cover rounded-lg shrink-0 border border-sand"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-charcoal truncate">{item.name}</h4>
                      <p className="text-[11px] text-charcoal/50 font-mono">{item.sku || 'NDL-PROD'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                      {item.stockCount} left
                    </span>
                    <button
                      onClick={() => setSelectedStockProduct(item)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-plum bg-white border border-sand/80 hover:bg-sand/40 rounded-md transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Trail Log */}
        <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Immutable Audit Activity</h3>
              <p className="text-xs text-charcoal/60">Document 02 Section 15 Accountability Log</p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-semibold text-plum hover:underline flex items-center gap-1"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-sand/50 bg-sand/10 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-plum/10 text-plum font-mono">
                      {log.category}
                    </span>
                    <span className="font-semibold text-charcoal truncate">{log.action}</span>
                  </div>
                  <p className="text-[11px] text-charcoal/70 line-clamp-1">{log.details}</p>
                  <div className="text-[10px] text-charcoal/50">
                    By <strong className="text-charcoal/80">{log.actorName}</strong> ({log.actorRole})
                  </div>
                </div>

                <span className="text-[10px] text-charcoal/50 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedStockProduct && (
        <StockAdjustModal
          product={selectedStockProduct}
          onClose={() => setSelectedStockProduct(null)}
        />
      )}

      {/* Add Product Modal */}
      {productModalOpen && (
        <ProductModal
          onClose={() => setProductModalOpen(false)}
        />
      )}
    </div>
  );
};
