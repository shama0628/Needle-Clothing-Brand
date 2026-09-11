import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  Package,
  ExternalLink,
  Edit2,
  CheckCircle,
  Eye,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  subcategories: {
    slug: string;
    label: string;
    description: string;
  }[];
}

const TAXONOMY: CategoryConfig[] = [
  {
    id: 'cat-hijab',
    name: 'The Hijab Atelier',
    slug: 'hijab',
    description: 'Natural modal fibers, stretch jersey, and lustrous partywear satins.',
    bannerImage: '/assets/coverpages/plain-modal-coverpage.png',
    subcategories: [
      { slug: 'classical-jersey', label: 'Classical Jersey Hijab', description: 'Everyday non-slip 220 GSM modal stretch' },
      { slug: 'printed-modal', label: 'Printed Modal', description: 'Artisanal water-based botanical and geometric prints' },
      { slug: 'plain-modal', label: 'Plain Modal', description: 'Breathable sustainable Lenzing™ modal featherlight weave' },
      { slug: 'partywear', label: 'Partywear Hijabs', description: 'Evening shimmer satins with delicate embroidered borders' }
    ]
  },
  {
    id: 'cat-clothing',
    name: 'Modest Clothing',
    slug: 'clothing',
    description: 'Sculpted abayas, flowing maxi skirts, fluid co-ords and modest tunic tops.',
    bannerImage: '/assets/coverpages/dresses-coverpage.png',
    subcategories: [
      { slug: 'dresses', label: 'Dresses & Abayas', description: 'Full-length pleated silhouettes in premium silk-linen blends' },
      { slug: 'coord-sets', label: 'Co-ord Sets', description: 'Tailored matching two-piece ensemble sets' },
      { slug: 'tops', label: 'Tops & Tunics', description: 'Generous drape high-neckline tunic tops' },
      { slug: 'skirts', label: 'Maxi Skirts', description: 'Tiered linen and A-line modest skirts' }
    ]
  },
  {
    id: 'cat-accessories',
    name: 'Atelier Accessories',
    slug: 'accessories',
    description: 'Essential pairings: non-slip bamboo undercapes, no-snag magnets, and fine pins.',
    bannerImage: '/assets/hijab-magnets/product-1.jpg',
    subcategories: [
      { slug: 'undercapes', label: 'Undercapes', description: 'Breathable organic bamboo cross-front caps' },
      { slug: 'hijab-magnets', label: 'Hijab Magnets', description: 'Ultra-strong neodymium no-snag matte magnets' },
      { slug: 'hijab-pins', label: 'Hijab Pins', description: 'Handcrafted pearl and stainless steel straight pins' }
    ]
  }
];

export const AdminCategoriesPage: React.FC = () => {
  const { products } = useStore();

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
          Collections & Category Taxonomy
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Document 02 Section 9 • Merchandising hierarchy, banner imagery, and product assignments.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {TAXONOMY.map(category => {
          const categoryProducts = products.filter(p => p.category === category.slug);

          return (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden"
            >
              {/* Category Banner Header */}
              <div className="relative h-32 md:h-40 overflow-hidden">
                <img
                  src={category.bannerImage}
                  alt={category.name}
                  className="w-full h-full object-cover object-center filter brightness-[0.7]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/40 to-transparent flex items-end p-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4 text-beige">
                    <div>
                      <span className="text-[10px] uppercase tracking-editorial font-bold text-amber-300 block mb-1">
                        Core Taxonomy
                      </span>
                      <h2 className="text-xl md:text-2xl font-serif font-light text-beige">
                        {category.name}
                      </h2>
                      <p className="text-xs text-beige/80 max-w-xl line-clamp-1 mt-0.5">
                        {category.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-beige">
                        {categoryProducts.length} Products Linked
                      </span>
                      <a
                        href={`/${category.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-beige text-plum rounded-full text-xs font-semibold hover:bg-beige/90 transition-colors flex items-center gap-1.5"
                      >
                        <span>View Store Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subcategories Table */}
              <div className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-3">
                  Subcategory Taxonomy & Catalog Counts
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.subcategories.map(sub => {
                    const subProducts = products.filter(p => p.subcategory === sub.slug);

                    return (
                      <div
                        key={sub.slug}
                        className="p-4 rounded-xl bg-sand/20 border border-sand/50 flex items-center justify-between hover:bg-sand/30 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-xs font-semibold text-charcoal">{sub.label}</h4>
                            <code className="text-[10px] text-plum font-mono bg-plum/10 px-1.5 py-0.2 rounded">
                              /{category.slug}/{sub.slug}
                            </code>
                          </div>
                          <p className="text-[11px] text-charcoal/60 truncate">{sub.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-xs font-bold text-plum bg-white px-2.5 py-1 rounded-md border border-sand shadow-2xs">
                            {subProducts.length} items
                          </span>
                          <a
                            href={`/${category.slug}/${sub.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-charcoal/40 hover:text-plum rounded-md transition-colors"
                            title="Preview subcategory page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
