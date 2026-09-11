import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Tag,
  DollarSign,
  Package
} from 'lucide-react';
import { Product, CategorySlug, SubcategorySlug } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

const CATEGORIES: { slug: CategorySlug; label: string; subcategories: { slug: SubcategorySlug; label: string }[] }[] = [
  {
    slug: 'hijab',
    label: 'The Hijab Atelier',
    subcategories: [
      { slug: 'classical-jersey', label: 'Classical Jersey Hijab' },
      { slug: 'printed-modal', label: 'Printed Modal' },
      { slug: 'plain-modal', label: 'Plain Modal' },
      { slug: 'partywear', label: 'Partywear Hijabs' }
    ]
  },
  {
    slug: 'clothing',
    label: 'Modest Clothing',
    subcategories: [
      { slug: 'dresses', label: 'Dresses & Abayas' },
      { slug: 'coord-sets', label: 'Co-ord Sets' },
      { slug: 'tops', label: 'Tops & Tunics' },
      { slug: 'skirts', label: 'Maxi Skirts' }
    ]
  },
  {
    slug: 'accessories',
    label: 'Atelier Accessories',
    subcategories: [
      { slug: 'undercapes', label: 'Undercapes' },
      { slug: 'hijab-magnets', label: 'Hijab Magnets' },
      { slug: 'hijab-pins', label: 'Hijab Pins' }
    ]
  }
];

const PRESET_ASSETS = [
  '/assets/classical-jersey/product-1.jpg',
  '/assets/classical-jersey/product-2.jpg',
  '/assets/classical-jersey/product-3.jpg',
  '/assets/classical-jersey/product-4.jpg',
  '/assets/plain-modal/product-1.jpeg',
  '/assets/plain-modal/product-2.jpeg',
  '/assets/plain-modal/product-3.jpeg',
  '/assets/plain-modal/product-4.jpeg',
  '/assets/printed-modal/product-1.jpeg',
  '/assets/printed-modal/product-2.jpeg',
  '/assets/printed-modal/product-3.jpeg',
  '/assets/printed-modal/product-4.jpeg',
  '/assets/partywear/product-1.png',
  '/assets/partywear/product-2.png',
  '/assets/partywear/product-3.png',
  '/assets/partywear/product-4.png',
  '/assets/dresses/product-1.png',
  '/assets/dresses/product-2.png',
  '/assets/dresses/product-3.png',
  '/assets/dresses/product-4.png',
  '/assets/coord-sets/product-1.png',
  '/assets/coord-sets/product-2.png',
  '/assets/coord-sets/product-3.png',
  '/assets/coord-sets/product-4.png',
  '/assets/tops/product-1.png',
  '/assets/tops/product-2.png',
  '/assets/tops/product-3.png',
  '/assets/skirts/product-1.png',
  '/assets/skirts/product-2.png',
  '/assets/skirts/product-3.png',
  '/assets/skirts/product-4.png',
  '/assets/undercapes/product-1.jpg',
  '/assets/undercapes/product-2.jpg',
  '/assets/undercapes/product-3.jpg',
  '/assets/hijab-magnets/product-1.jpg',
  '/assets/hijab-magnets/product-2.jpg',
  '/assets/hijab-pins/product-1.jpg'
];

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const isEditing = !!product;
  const { logAction } = useAdmin();
  const { addProduct, updateProduct } = useStore();

  // Form State
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [subtitle, setSubtitle] = useState(product?.subtitle || '');
  const [category, setCategory] = useState<CategorySlug>(product?.category || 'hijab');
  const [subcategory, setSubcategory] = useState<SubcategorySlug>(product?.subcategory || 'classical-jersey');
  const [sku, setSku] = useState(product?.sku || `NDL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(product?.status || 'published');

  const [price, setPrice] = useState<number>(product?.price || 45);
  const [salePrice, setSalePrice] = useState<number | undefined>(product?.salePrice);
  const [costPrice, setCostPrice] = useState<number>(product?.costPrice || Math.round((product?.price || 45) * 0.38));
  const [stockCount, setStockCount] = useState<number>(product?.stockCount ?? 25);

  const [primaryImage, setPrimaryImage] = useState(product?.primaryImage || PRESET_ASSETS[0]);
  const [gallery, setGallery] = useState<string[]>(product?.gallery || [PRESET_ASSETS[0]]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [description, setDescription] = useState(
    product?.description || 'Crafted with delicate attention to fluid drape, modest proportions, and breathable luxury fibers.'
  );
  const [material, setMaterial] = useState(product?.material || '100% Sustainable Lenzing™ Modal');
  const [fit, setFit] = useState(product?.fit || 'Generous dimensions with fluid cascading drape');
  const [care, setCare] = useState<string>(
    product?.care?.join('\n') || 'Hand wash cold or dry clean\nLay flat to dry in shade\nSteam on low heat'
  );
  const [dimensions, setDimensions] = useState(product?.dimensions || '190 cm x 70 cm');

  // Merchandising & Tags
  const [isNew, setIsNew] = useState(product?.isNew ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);

  const [paletteTags, setPaletteTags] = useState<string[]>(
    product?.paletteTags || ['warm', 'earthy', 'soft']
  );

  // Colors
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(
    product?.colors || [
      { name: 'Desert Sand', hex: '#D2B48C' },
      { name: 'Onyx Noir', hex: '#1E1B18' }
    ]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#6A4C93');

  // Sizes
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes || ['Standard Wrap', 'Generous Wrap']
  );
  const [newSize, setNewSize] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  // Auto-generate slug from name if creating
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const handleAddSize = () => {
    if (!newSize.trim() || sizes.includes(newSize.trim())) return;
    setSizes([...sizes, newSize.trim()]);
    setNewSize('');
  };

  const handleRemoveSize = (sz: string) => {
    setSizes(sizes.filter(s => s !== sz));
  };

  const togglePaletteTag = (tag: string) => {
    if (paletteTags.includes(tag)) {
      setPaletteTags(paletteTags.filter(t => t !== tag));
    } else {
      setPaletteTags([...paletteTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Business rule validations from Doc 02 Section 17
    if (!name.trim() || !slug.trim()) {
      setError('Product Name and Slug are required.');
      return;
    }

    if (price < 0) {
      setError('Price cannot be negative.');
      return;
    }

    if (salePrice !== undefined && salePrice > 0) {
      if (salePrice > price) {
        setError('Sale price cannot exceed base price (Doc 02 Section 17).');
        return;
      }
    }

    if (colors.length === 0) {
      setError('At least one color option is required.');
      return;
    }

    if (sizes.length === 0) {
      setError('At least one size option is required.');
      return;
    }

    const careList = care
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean);

    const productPayload: Product = {
      id: product?.id || `prod-${Date.now()}`,
      slug: slug.trim(),
      name: name.trim(),
      subtitle: subtitle.trim(),
      category,
      subcategory,
      price: Number(price),
      salePrice: salePrice && salePrice > 0 ? Number(salePrice) : undefined,
      costPrice: Number(costPrice),
      status,
      sku: sku.trim(),
      rating: product?.rating || 4.9,
      reviewCount: product?.reviewCount || 12,
      primaryImage,
      gallery: gallery.length > 0 ? gallery : [primaryImage],
      description: description.trim(),
      material: material.trim(),
      fit: fit.trim(),
      care: careList,
      dimensions: dimensions.trim(),
      sizes,
      colors,
      paletteTags,
      isNew,
      isFeatured,
      isBestSeller,
      inStock: stockCount > 0,
      stockCount: Number(stockCount)
    };

    if (isEditing && product) {
      updateProduct(product.id, productPayload);
      logAction(
        'product',
        'Updated Product',
        `Edited product details for "${product.name}" (${sku}).`,
        product.id,
        product.name,
        { before: product, after: productPayload }
      );
    } else {
      addProduct(productPayload);
      logAction(
        'product',
        'Created New Product',
        `Created new product "${productPayload.name}" in category ${category} / ${subcategory}.`,
        productPayload.id,
        productPayload.name
      );
    }

    onClose();
  };

  const availableSubcategories = CATEGORIES.find(c => c.slug === category)?.subcategories || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-sand shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between bg-sand/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-plum text-beige flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">
                {isEditing ? `Edit Product: ${product?.name}` : 'Create New Product'}
              </h3>
              <p className="text-[11px] text-charcoal/60">
                Document 02 Specification • Dynamic Merchandising
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-sand/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum mb-3 flex items-center gap-1.5">
              <span>01. Basic Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Aurelia Pleated Silk Abaya"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  URL Slug (SEO Path) *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="aurelia-pleated-silk-abaya"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  SKU Identifier *
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="NDL-DR-1"
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Publishing Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                >
                  <option value="published">Published (Visible in Store)</option>
                  <option value="draft">Draft (Staff Only)</option>
                  <option value="archived">Archived (Historical Record)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Primary Category *
                </label>
                <select
                  value={category}
                  onChange={e => {
                    const newCat = e.target.value as CategorySlug;
                    setCategory(newCat);
                    const subs = CATEGORIES.find(c => c.slug === newCat)?.subcategories;
                    if (subs && subs.length > 0) {
                      setSubcategory(subs[0].slug);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Subcategory Taxonomy *
                </label>
                <select
                  value={subcategory}
                  onChange={e => setSubcategory(e.target.value as SubcategorySlug)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                >
                  {availableSubcategories.map(s => (
                    <option key={s.slug} value={s.slug}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Editorial Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="e.g. Sculpted Silk-Linen & Hand-Pleated Bodice"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock Control */}
          <div className="pt-4 border-t border-sand/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum mb-3">
              02. Pricing & Inventory Control
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Base Price ($ USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Sale Price ($ USD, Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={salePrice || ''}
                  onChange={e => setSalePrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Leave empty if regular"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Cost Price (Internal / Admin)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={costPrice}
                  onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Sellable Stock Units *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockCount}
                  onChange={e => setStockCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media & Imagery */}
          <div className="pt-4 border-t border-sand/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-plum">
                03. Product Imagery
              </h4>
              <button
                type="button"
                onClick={() => setAssetPickerOpen(!assetPickerOpen)}
                className="text-[11px] text-plum font-semibold hover:underline flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{assetPickerOpen ? 'Hide Asset Library' : 'Choose from NEEDLE Assets'}</span>
              </button>
            </div>

            {/* Asset Library Drawer */}
            {assetPickerOpen && (
              <div className="p-3 bg-sand/30 rounded-xl border border-sand mb-4">
                <span className="text-[11px] font-semibold text-charcoal/80 block mb-2">
                  Select Brand Asset as Primary Photo:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
                  {PRESET_ASSETS.map((asset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setPrimaryImage(asset);
                        if (!gallery.includes(asset)) {
                          setGallery([asset, ...gallery]);
                        }
                      }}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all group ${
                        primaryImage === asset ? 'border-plum ring-2 ring-plum/40 scale-95' : 'border-transparent hover:border-sand'
                      }`}
                    >
                      <img src={asset} alt="Asset" className="w-full h-full object-cover" />
                      {primaryImage === asset && (
                        <div className="absolute inset-0 bg-plum/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Primary Thumbnail Preview
                </label>
                <div className="relative aspect-[3/4] max-w-[180px] rounded-xl overflow-hidden border border-sand bg-sand/20 shadow-sm">
                  <img
                    src={primaryImage}
                    alt="Primary"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/coverpages/coverpage-1.jpg';
                    }}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    Primary Image URL
                  </label>
                  <input
                    type="text"
                    value={primaryImage}
                    onChange={e => setPrimaryImage(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    Add Gallery Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customImageUrl}
                      onChange={e => setCustomImageUrl(e.target.value)}
                      placeholder="/assets/... or https://..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim() && !gallery.includes(customImageUrl.trim())) {
                          setGallery([...gallery, customImageUrl.trim()]);
                          setCustomImageUrl('');
                        }
                      }}
                      className="px-3 py-2 bg-sand/60 hover:bg-sand text-xs font-semibold text-charcoal rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {gallery.length > 0 && (
                  <div>
                    <span className="text-[11px] text-charcoal/70 block mb-1.5">Gallery Shots ({gallery.length}):</span>
                    <div className="flex flex-wrap gap-2">
                      {gallery.map((img, i) => (
                        <div key={i} className="relative group w-12 h-16 rounded-md overflow-hidden border border-sand">
                          <img src={img} alt="Gallery item" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                            className="absolute inset-0 bg-rose-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Variants (Colors & Sizes) */}
          <div className="pt-4 border-t border-sand/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum mb-3">
              04. Variants, Colors & Sizes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colors */}
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-2">
                  Color Swatches ({colors.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colors.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-sand bg-white shadow-xs text-xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-medium text-charcoal">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(i)}
                        className="p-1 text-charcoal/40 hover:text-rose-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={e => setNewColorHex(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-sand p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Sage Whisper)"
                    value={newColorName}
                    onChange={e => setNewColorName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-sand/80 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 bg-plum text-beige text-xs font-semibold rounded-lg hover:bg-plum/90 shrink-0"
                  >
                    Add Color
                  </button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-2">
                  Available Sizes ({sizes.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {sizes.map(sz => (
                    <div
                      key={sz}
                      className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full border border-sand bg-white shadow-xs text-xs font-medium text-charcoal"
                    >
                      <span>{sz}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(sz)}
                        className="p-1 text-charcoal/40 hover:text-rose-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. S (54 Length), Maxi Wrap"
                    value={newSize}
                    onChange={e => setNewSize(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-sand/80 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-1.5 bg-plum text-beige text-xs font-semibold rounded-lg hover:bg-plum/90 shrink-0"
                  >
                    Add Size
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Garment Details & Editorial Copy */}
          <div className="pt-4 border-t border-sand/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum mb-3">
              05. Atelier Garment Details
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 focus:ring-2 focus:ring-plum/30 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    Fabric & Material
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    Silhouette & Fit
                  </label>
                  <input
                    type="text"
                    value={fit}
                    onChange={e => setFit(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Care Instructions (one per line)
                </label>
                <textarea
                  rows={2}
                  value={care}
                  onChange={e => setCare(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Merchandising Badges & Color Theory Tags */}
          <div className="pt-4 border-t border-sand/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum mb-3">
              06. Badges & Color Theory Merchandising
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-4 items-center p-3 bg-sand/20 rounded-xl border border-sand/50">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={e => setIsNew(e.target.checked)}
                    className="w-4 h-4 rounded text-plum focus:ring-plum"
                  />
                  <span>New Arrival Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-plum focus:ring-plum"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={e => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 rounded text-plum focus:ring-plum"
                  />
                  <span>Best Seller Tag</span>
                </label>
              </div>

              {/* Color Theory Tags */}
              <div>
                <span className="text-xs font-medium text-charcoal/80 block mb-1.5">
                  Color Theory Palette Associations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['warm', 'cool', 'olive', 'neutral', 'deep', 'soft', 'earthy'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => togglePaletteTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize border transition-all ${
                        paletteTags.includes(tag)
                          ? 'bg-plum text-beige border-plum shadow-xs'
                          : 'bg-white text-charcoal/70 border-sand hover:bg-sand/30'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-sand/40 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-charcoal/70 hover:bg-sand/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-beige bg-plum hover:bg-plum/90 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Product Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
