import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Boxes,
  Archive,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { Product, CategorySlug } from '../../types';
import { ProductModal } from '../../components/admin/ProductModal';
import { StockAdjustModal } from '../../components/admin/StockAdjustModal';

export const AdminProductsPage: React.FC = () => {
  const { products, updateProduct, deleteProduct, archiveProduct } = useStore();
  const { logAction } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);

  // Filter logic
  const filteredProducts = products.filter(p => {
    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.subcategory.toLowerCase().includes(q);

    // Category
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    // Status
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    // Stock
    let matchesStock = true;
    if (stockFilter === 'out') matchesStock = p.stockCount === 0;
    else if (stockFilter === 'low') matchesStock = p.stockCount > 0 && p.stockCount <= 10;
    else if (stockFilter === 'in') matchesStock = p.stockCount > 10;

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const handleToggleStatus = (prod: Product) => {
    const nextStatus = prod.status === 'published' ? 'draft' : 'published';
    updateProduct(prod.id, { status: nextStatus });
    logAction(
      'product',
      'Product Status Changed',
      `Toggled status of "${prod.name}" to ${nextStatus.toUpperCase()}`,
      prod.id,
      prod.name,
      { before: { status: prod.status }, after: { status: nextStatus } }
    );
  };

  const handleDelete = (prod: Product) => {
    if (window.confirm(`Are you sure you want to delete or archive "${prod.name}"?`)) {
      const res = deleteProduct(prod.id);
      logAction(
        'product',
        'Removed / Archived Product',
        `Attempted deletion of "${prod.name}". Result: ${res.message}`,
        prod.id,
        prod.name
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Product Catalogue
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Manage titles, pricing, variants, merchandising and inventory across all ateliers.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="bg-plum text-beige hover:bg-plum/90 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sand/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search products by title, SKU (e.g. NDL-PM-1), subcategory..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-sand/10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
          >
            <option value="all">All Categories</option>
            <option value="hijab">The Hijab Atelier</option>
            <option value="clothing">Modest Clothing</option>
            <option value="accessories">Accessories</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
          >
            <option value="all">All Inventory</option>
            <option value="in">In Stock (&gt; 10)</option>
            <option value="low">Low Stock (1 - 10)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-charcoal/60 pt-1 border-t border-sand/30">
          <span>Showing <strong>{filteredProducts.length}</strong> of {products.length} products</span>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || stockFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setStockFilter('all');
              }}
              className="text-plum hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal">
            <thead className="bg-sand/20 text-charcoal/70 uppercase tracking-wider text-[10px] font-semibold border-b border-sand/40">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-3">SKU & Taxonomy</th>
                <th className="py-3.5 px-3">Price / Sale</th>
                <th className="py-3.5 px-3">Stock Units</th>
                <th className="py-3.5 px-3">Publish Status</th>
                <th className="py-3.5 px-3">Merchandising</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {filteredProducts.map(product => {
                const isLow = product.stockCount > 0 && product.stockCount <= 10;
                const isOut = product.stockCount === 0;

                return (
                  <tr key={product.id} className="hover:bg-sand/10 transition-colors group">
                    {/* Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="w-12 h-14 object-cover rounded-lg border border-sand shrink-0 shadow-xs"
                        />
                        <div className="min-w-0 max-w-xs">
                          <h4 className="font-semibold text-charcoal truncate group-hover:text-plum transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-charcoal/50 truncate">{product.subtitle}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {product.colors.slice(0, 4).map((col, i) => (
                              <span
                                key={i}
                                title={col.name}
                                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                                style={{ backgroundColor: col.hex }}
                              />
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-[9px] text-charcoal/40">+{product.colors.length - 4}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Taxonomy */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold text-charcoal/80 block">
                        {product.sku || 'NDL-PROD'}
                      </span>
                      <span className="text-[10px] text-charcoal/60 capitalize block">
                        {product.category} &gt; {product.subcategory}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        {product.salePrice ? (
                          <>
                            <span className="font-bold text-plum">${product.salePrice.toFixed(2)}</span>
                            <span className="line-through text-charcoal/40 text-[11px]">
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-charcoal">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      {product.costPrice && (
                        <span className="text-[10px] text-charcoal/40 block">
                          Cost: ${product.costPrice.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {product.stockCount} units
                        </span>
                        <button
                          onClick={() => setStockModalProduct(product)}
                          title="Adjust stock"
                          className="p-1 text-charcoal/40 hover:text-plum rounded transition-colors"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                          product.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : product.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                            : 'bg-sand/40 text-charcoal/60 border-sand hover:bg-sand/60'
                        }`}
                        title="Click to toggle between Published and Draft"
                      >
                        {product.status || 'published'}
                      </button>
                    </td>

                    {/* Badges */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {product.isNew && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                            New
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-plum/10 text-plum">
                            Featured
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                            Best
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/product/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on live storefront"
                          className="p-1.5 text-charcoal/50 hover:text-plum hover:bg-sand/30 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setModalOpen(true);
                          }}
                          title="Edit product specification"
                          className="p-1.5 text-charcoal/50 hover:text-plum hover:bg-sand/30 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          title="Archive or delete product"
                          className="p-1.5 text-charcoal/50 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Stock Adjust Modal */}
      {stockModalProduct && (
        <StockAdjustModal
          product={stockModalProduct}
          onClose={() => setStockModalProduct(null)}
        />
      )}
    </div>
  );
};
