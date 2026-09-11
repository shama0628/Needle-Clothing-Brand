import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface CategoryMetadata {
  title: string;
  categorySlug: 'hijab' | 'clothing' | 'accessories' | 'all';
  subcategorySlug?: string;
  subtitle: string;
  description: string;
  coverImage: string;
  subcategories: { label: string; path: string; slug: string }[];
}

const CATEGORY_MAP: Record<string, CategoryMetadata> = {
  // Main Categories
  'hijab': {
    title: 'The Hijab Atelier',
    categorySlug: 'hijab',
    subtitle: 'Timeless Drapes & Natural Fibers',
    description: 'From breathable 220 GSM stretch jersey to featherlight sustainable Lenzing™ modal and lustrous evening satins. Designed for effortless grace and non-slip security.',
    coverImage: '/assets/coverpages/plain-modal-coverpage.png',
    subcategories: [
      { label: 'All Hijabs', path: '/hijab', slug: 'all' },
      { label: 'Classical Jersey', path: '/hijab/classical-jersey', slug: 'classical-jersey' },
      { label: 'Printed Modal', path: '/hijab/printed-modal', slug: 'printed-modal' },
      { label: 'Plain Modal', path: '/hijab/plain-modal', slug: 'plain-modal' },
      { label: 'Partywear Hijabs', path: '/hijab/partywear', slug: 'partywear' }
    ]
  },
  'classical-jersey': {
    title: 'Classical Jersey Hijab',
    categorySlug: 'hijab',
    subcategorySlug: 'classical-jersey',
    subtitle: 'Everyday Non-Slip Stretch',
    description: 'Crafted from premium 220 GSM modal rayon with 5% spandex. Delivers full coverage and an effortless, pin-free drape that holds shape all day.',
    coverImage: '/assets/classical-jersey/product-1.jpg',
    subcategories: [
      { label: 'All Hijabs', path: '/hijab', slug: 'all' },
      { label: 'Classical Jersey', path: '/hijab/classical-jersey', slug: 'classical-jersey' },
      { label: 'Printed Modal', path: '/hijab/printed-modal', slug: 'printed-modal' },
      { label: 'Plain Modal', path: '/hijab/plain-modal', slug: 'plain-modal' },
      { label: 'Partywear Hijabs', path: '/hijab/partywear', slug: 'partywear' }
    ]
  },
  'printed-modal': {
    title: 'Artisanal Printed Modal',
    categorySlug: 'hijab',
    subcategorySlug: 'printed-modal',
    subtitle: 'Hand-Drawn & Botanical Motifs',
    description: 'Water-based pigment prints on featherweight beechwood modal. Breathable and fluid, featuring botanical greenhouse foliage and antique Mediterranean tilework.',
    coverImage: '/assets/printed-modal/product-4.jpeg',
    subcategories: [
      { label: 'All Hijabs', path: '/hijab', slug: 'all' },
      { label: 'Classical Jersey', path: '/hijab/classical-jersey', slug: 'classical-jersey' },
      { label: 'Printed Modal', path: '/hijab/printed-modal', slug: 'printed-modal' },
      { label: 'Plain Modal', path: '/hijab/plain-modal', slug: 'plain-modal' },
      { label: 'Partywear Hijabs', path: '/hijab/partywear', slug: 'partywear' }
    ]
  },
  'plain-modal': {
    title: 'Pure Plain Modal',
    categorySlug: 'hijab',
    subcategorySlug: 'plain-modal',
    subtitle: 'Featherlight 90 GSM Luxury',
    description: '100% Lenzing™ Modal from certified sustainable European forests. Whispering softness with a delicate raw eyelash hem.',
    coverImage: '/assets/coverpages/plain-modal-coverpage.png',
    subcategories: [
      { label: 'All Hijabs', path: '/hijab', slug: 'all' },
      { label: 'Classical Jersey', path: '/hijab/classical-jersey', slug: 'classical-jersey' },
      { label: 'Printed Modal', path: '/hijab/printed-modal', slug: 'printed-modal' },
      { label: 'Plain Modal', path: '/hijab/plain-modal', slug: 'plain-modal' },
      { label: 'Partywear Hijabs', path: '/hijab/partywear', slug: 'partywear' }
    ]
  },
  'partywear': {
    title: 'Lustrous Partywear Hijabs',
    categorySlug: 'hijab',
    subcategorySlug: 'partywear',
    subtitle: 'Occasion & Bridal Pleats',
    description: 'Liquid metallic shine and permanent fine pleating tailored for evening galas, Eid, and bridal celebrations.',
    coverImage: '/assets/partywear-hijabs/product-1.jpeg',
    subcategories: [
      { label: 'All Hijabs', path: '/hijab', slug: 'all' },
      { label: 'Classical Jersey', path: '/hijab/classical-jersey', slug: 'classical-jersey' },
      { label: 'Printed Modal', path: '/hijab/printed-modal', slug: 'printed-modal' },
      { label: 'Plain Modal', path: '/hijab/plain-modal', slug: 'plain-modal' },
      { label: 'Partywear Hijabs', path: '/hijab/partywear', slug: 'partywear' }
    ]
  },

  // Clothing
  'clothing': {
    title: 'The Clothing Collection',
    categorySlug: 'clothing',
    subtitle: 'Modest Silhouettes & Modern Tailoring',
    description: 'Architectural cuts, sweeping maxi lengths, and harmonious two-piece co-ord sets crafted in washed linen, silk crepes, and structured cottons.',
    coverImage: '/assets/coverpages/dresses-coverpage.png',
    subcategories: [
      { label: 'All Clothing', path: '/clothing', slug: 'all' },
      { label: 'Dresses', path: '/clothing/dresses', slug: 'dresses' },
      { label: 'Co-ord Sets', path: '/clothing/coord-sets', slug: 'coord-sets' },
      { label: 'Tops', path: '/clothing/tops', slug: 'tops' },
      { label: 'Skirts', path: '/clothing/skirts', slug: 'skirts' }
    ]
  },
  'dresses': {
    title: 'The Dress Edit',
    categorySlug: 'clothing',
    subcategorySlug: 'dresses',
    subtitle: 'Floor-Length Modest Elegance',
    description: 'High-neck maxi dresses, French-inspired polka jacquards, and European washed linen tiering with full opaque linings.',
    coverImage: '/assets/coverpages/dresses-coverpage.png',
    subcategories: [
      { label: 'All Clothing', path: '/clothing', slug: 'all' },
      { label: 'Dresses', path: '/clothing/dresses', slug: 'dresses' },
      { label: 'Co-ord Sets', path: '/clothing/coord-sets', slug: 'coord-sets' },
      { label: 'Tops', path: '/clothing/tops', slug: 'tops' },
      { label: 'Skirts', path: '/clothing/skirts', slug: 'skirts' }
    ]
  },
  'coord-sets': {
    title: 'Signature Co-ord Sets',
    categorySlug: 'clothing',
    subcategorySlug: 'coord-sets',
    subtitle: 'Effortless Two-Piece Harmony',
    description: 'Longline tunics paired with fluid wide-leg palazzo pants and sweeping A-line maxi skirts in textured crepes and cupro.',
    coverImage: '/assets/coord-sets/product-6.jpeg',
    subcategories: [
      { label: 'All Clothing', path: '/clothing', slug: 'all' },
      { label: 'Dresses', path: '/clothing/dresses', slug: 'dresses' },
      { label: 'Co-ord Sets', path: '/clothing/coord-sets', slug: 'coord-sets' },
      { label: 'Tops', path: '/clothing/tops', slug: 'tops' },
      { label: 'Skirts', path: '/clothing/skirts', slug: 'skirts' }
    ]
  },
  'tops': {
    title: 'Everyday Modest Tops',
    categorySlug: 'clothing',
    subcategorySlug: 'tops',
    subtitle: 'Layering Foundations',
    description: 'High collars, lengthened bodices, and balloon button cuffs designed to sit gracefully over trousers and under vests.',
    coverImage: '/assets/tops/product-1.jpeg',
    subcategories: [
      { label: 'All Clothing', path: '/clothing', slug: 'all' },
      { label: 'Dresses', path: '/clothing/dresses', slug: 'dresses' },
      { label: 'Co-ord Sets', path: '/clothing/coord-sets', slug: 'coord-sets' },
      { label: 'Tops', path: '/clothing/tops', slug: 'tops' },
      { label: 'Skirts', path: '/clothing/skirts', slug: 'skirts' }
    ]
  },
  'skirts': {
    title: 'Flowing Maxi Skirts',
    categorySlug: 'clothing',
    subcategorySlug: 'skirts',
    subtitle: 'Autumn Capsule Preview',
    description: 'Sculptural sunray pleats and bias-cut satins created for fluid movement. Full modesty lining with concealed zipper closures.',
    coverImage: '/assets/coverpages/dresses-coverpage.png',
    subcategories: [
      { label: 'All Clothing', path: '/clothing', slug: 'all' },
      { label: 'Dresses', path: '/clothing/dresses', slug: 'dresses' },
      { label: 'Co-ord Sets', path: '/clothing/coord-sets', slug: 'coord-sets' },
      { label: 'Tops', path: '/clothing/tops', slug: 'tops' },
      { label: 'Skirts', path: '/clothing/skirts', slug: 'skirts' }
    ]
  },

  // Accessories (Part D Consolidated)
  'accessories': {
    title: 'Curated Accessories',
    categorySlug: 'accessories',
    subtitle: 'Hardware & Care Essentials',
    description: 'No-snag rare earth neodymium magnets, jewelled crystal styling wheels, and 100% mulberry silk-lined protective undercaps.',
    coverImage: '/assets/hijab-magnets/product-1.jpg',
    subcategories: []
  },
  'undercapes': {
    title: 'Curated Accessories',
    categorySlug: 'accessories',
    subtitle: 'Hardware & Care Essentials',
    description: 'No-snag rare earth neodymium magnets, jewelled crystal styling wheels, and 100% mulberry silk-lined protective undercaps.',
    coverImage: '/assets/hijab-magnets/product-1.jpg',
    subcategories: []
  },
  'hijab-magnets': {
    title: 'Curated Accessories',
    categorySlug: 'accessories',
    subtitle: 'Hardware & Care Essentials',
    description: 'No-snag rare earth neodymium magnets, jewelled crystal styling wheels, and 100% mulberry silk-lined protective undercaps.',
    coverImage: '/assets/hijab-magnets/product-1.jpg',
    subcategories: []
  },
  'hijab-pins': {
    title: 'Curated Accessories',
    categorySlug: 'accessories',
    subtitle: 'Hardware & Care Essentials',
    description: 'No-snag rare earth neodymium magnets, jewelled crystal styling wheels, and 100% mulberry silk-lined protective undercaps.',
    coverImage: '/assets/hijab-magnets/product-1.jpg',
    subcategories: []
  },

  // View All
  'all': {
    title: 'The Complete Atelier',
    categorySlug: 'all',
    subtitle: 'All NEEDLE Creations',
    description: 'Explore our complete collection of luxury modest fashion, artisanal hijabs, and curated hardware accessories.',
    coverImage: '/assets/coverpages/coverpage-1.jpg',
    subcategories: [
      { label: 'All', path: '/shop', slug: 'all' },
      { label: 'Hijabs', path: '/hijab', slug: 'hijab' },
      { label: 'Clothing', path: '/clothing', slug: 'clothing' },
      { label: 'Accessories', path: '/accessories', slug: 'accessories' }
    ]
  }
};

export const CategoryPage: React.FC = () => {
  const { category, subcategory } = useParams<{ category?: string; subcategory?: string }>();
  const { products } = useStore();

  // Lookup metadata based on route
  const currentKey = subcategory || category || 'all';
  const meta = CATEGORY_MAP[currentKey] || CATEGORY_MAP['all'];

  // Filter states
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'bestseller'>('featured');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Exclude archived
      if (p.status === 'archived') return false;

      // Category filter
      if (meta.subcategorySlug) {
        if (p.subcategory !== meta.subcategorySlug) return false;
      } else if (meta.categorySlug !== 'all') {
        if (p.category !== meta.categorySlug) return false;
      }

      // Color filter
      if (selectedColor) {
        const matches = p.colors.some(c => c.name.toLowerCase().includes(selectedColor.toLowerCase()));
        if (!matches) return false;
      }

      // Size filter
      if (selectedSize) {
        const matches = p.sizes.some(s => s.toLowerCase().includes(selectedSize.toLowerCase()));
        if (!matches) return false;
      }

      // In stock
      if (inStockOnly && !p.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [meta, selectedColor, selectedSize, inStockOnly, sortBy]);

  const clearFilters = () => {
    setSelectedColor(null);
    setSelectedSize(null);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters = selectedColor || selectedSize || inStockOnly || sortBy !== 'featured';

  return (
    <div className="pt-20 min-h-screen bg-theme-bg text-theme-text">
      {/* Category Hero Banner */}
      <section className="relative bg-theme-surface-secondary text-theme-text py-16 sm:py-24 overflow-hidden border-b border-theme-border">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={meta.coverImage}
            alt={meta.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-theme-bg/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-text uppercase tracking-wider mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <span className="text-xs uppercase tracking-editorial text-theme-muted block mb-2 font-semibold">
            {meta.subtitle}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-theme-text mb-4">
            {meta.title}
          </h1>
          <p className="text-sm sm:text-base text-theme-muted font-light max-w-2xl leading-relaxed">
            {meta.description}
          </p>
        </div>
      </section>

      {/* Subcategory Pills (Only shown when subcategories exist - omitted for consolidated Accessories) */}
      {meta.subcategories.length > 0 && (
        <div className="border-b border-theme-border bg-theme-surface/85 sticky top-14 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar text-xs font-semibold uppercase tracking-wider">
              {meta.subcategories.map(sub => {
                const isActive =
                  (sub.slug === 'all' && !subcategory && (category === sub.path.replace('/', '') || !category)) ||
                  sub.slug === subcategory ||
                  (sub.path === `/${category}` && !subcategory);

                return (
                  <Link
                    key={sub.slug}
                    to={sub.path}
                    className={`px-4 py-2 whitespace-nowrap transition-colors rounded-none border ${
                      isActive
                        ? 'bg-theme-accent text-theme-accent-contrast border-theme-accent font-bold'
                        : 'bg-transparent text-theme-muted border-theme-border hover:border-theme-accent hover:text-theme-text'
                    }`}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-theme-border">
        {/* Left: Count and Active Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-theme-muted font-light">
            Showing <strong className="font-semibold text-theme-text">{filteredProducts.length}</strong> creations
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] uppercase tracking-wider text-theme-text underline font-semibold ml-2 hover:text-theme-muted"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Right: Sort & Filter Triggers */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="sm:hidden flex items-center gap-2 px-4 py-2 border border-theme-border text-xs font-semibold uppercase tracking-wider text-theme-text hover:border-theme-accent"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Desktop Filter Chips */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={selectedColor || ''}
              onChange={e => setSelectedColor(e.target.value || null)}
              className="text-xs bg-theme-surface border border-theme-border px-3 py-2 text-theme-text focus:outline-none focus:border-theme-accent"
            >
              <option value="">Color: All</option>
              <option value="Plum">Plum</option>
              <option value="Mocha">Mocha</option>
              <option value="Taupe">Taupe</option>
              <option value="Sand">Sand</option>
              <option value="Cream">Cream / Ivory</option>
              <option value="Olive">Olive</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
            </select>

            <select
              value={selectedSize || ''}
              onChange={e => setSelectedSize(e.target.value || null)}
              className="text-xs bg-theme-surface border border-theme-border px-3 py-2 text-theme-text focus:outline-none focus:border-theme-accent"
            >
              <option value="">Size: All</option>
              <option value="Standard">Standard Maxi Wrap</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs text-theme-muted cursor-pointer pl-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="accent-current w-3.5 h-3.5"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-theme-muted font-light hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-theme-surface border border-theme-border px-3 py-2 text-theme-text font-medium focus:outline-none focus:border-theme-accent uppercase tracking-wider"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="bestseller">Bestselling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-base font-semibold text-theme-text">No creations match your selected filters.</p>
            <p className="text-xs text-theme-muted font-light mt-1 max-w-sm mx-auto">
              Please adjust or clear your filter criteria to view all available pieces in this collection.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 bg-theme-accent text-theme-accent-contrast px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end sm:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-theme-surface text-theme-text h-full shadow-2xl p-6 flex flex-col justify-between z-10 border-l border-theme-border">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-theme-border mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-editorial text-theme-text">Filter Products</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-theme-muted hover:text-theme-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Color filter */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider font-semibold text-theme-muted mb-2">Color</p>
                <div className="space-y-1 text-xs">
                  {['Plum', 'Mocha', 'Taupe', 'Sand', 'Cream', 'Olive', 'Gold', 'Silver'].map(col => (
                    <label key={col} className="flex items-center gap-2 py-1 cursor-pointer text-theme-text">
                      <input
                        type="radio"
                        name="mobileColor"
                        checked={selectedColor === col}
                        onChange={() => setSelectedColor(col)}
                        className="accent-current"
                      />
                      <span>{col}</span>
                    </label>
                  ))}
                  {selectedColor && (
                    <button
                      onClick={() => setSelectedColor(null)}
                      className="text-[11px] text-theme-muted underline pt-1"
                    >
                      Clear color
                    </button>
                  )}
                </div>
              </div>

              {/* In stock */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs cursor-pointer font-medium text-theme-text">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="accent-current"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-theme-border">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-theme-accent text-theme-accent-contrast py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  clearFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full border border-theme-border text-theme-text py-2.5 text-xs uppercase tracking-wider hover:bg-theme-accent/5"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
