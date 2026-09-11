import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

export const SearchModal: React.FC = () => {
  const { searchModalOpen, setSearchModalOpen, products } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const trendingSearches = [
    'Dresses',
    'Jersey Hijabs',
    'Plain Modal',
    'Co-ords',
    'Partywear',
    'Hijab Magnets',
    'Terracotta'
  ];

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    const filtered = products.filter(p => {
      if (p.status === 'archived') return false;
      return (
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.colors.some(c => c.name.toLowerCase().includes(q)) ||
        p.paletteTags.some(t => t.toLowerCase().includes(q))
      );
    });

    setResults(filtered.slice(0, 8));
  }, [query]);

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setSearchModalOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-theme-surface text-theme-text shadow-2xl z-10 p-6 sm:p-8 flex flex-col max-h-[85vh] overflow-hidden border border-theme-border">
        {/* Close Button */}
        <button
          onClick={() => setSearchModalOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-theme-accent/10 text-theme-muted hover:text-theme-text transition-colors"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Heading */}
        <h2 className="text-xs uppercase tracking-editorial font-bold text-theme-muted mb-2">
          What are you looking for?
        </h2>

        {/* Search Input */}
        <div className="relative border-b-2 border-theme-accent pb-2 flex items-center gap-3">
          <Search className="w-6 h-6 text-theme-accent flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, categories, colors, fabrics..."
            className="w-full bg-transparent text-lg sm:text-2xl font-light text-theme-text placeholder:text-theme-muted/40 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-theme-muted hover:text-theme-text uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>

        {/* Trending Searches */}
        {!query && (
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-editorial font-semibold text-theme-muted mb-3">
              Trending Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="bg-theme-surface border border-theme-border hover:border-theme-accent hover:bg-theme-accent hover:text-theme-accent-contrast px-3.5 py-1.5 text-xs font-light tracking-wide rounded-full transition-colors text-theme-text"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Search Results */}
        {query && (
          <div className="mt-6 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-theme-muted">
                Found <span className="font-semibold text-theme-text">{results.length}</span> results for &ldquo;{query}&rdquo;
              </p>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map(prod => (
                  <Link
                    key={prod.id}
                    to={`/product/${prod.slug}`}
                    onClick={() => setSearchModalOpen(false)}
                    className="flex items-center gap-3.5 p-2 bg-theme-surface-subtle hover:bg-theme-accent/5 transition-colors border border-theme-border group"
                  >
                    <div className="w-16 h-20 bg-theme-surface overflow-hidden flex-shrink-0 border border-theme-border">
                      <img
                        src={prod.primaryImage}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-theme-text truncate group-hover:underline">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-theme-muted truncate">{prod.subtitle}</p>
                      <p className="text-xs font-medium text-theme-text mt-1">
                        ₹{(prod.salePrice ?? prod.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-theme-text group-hover:translate-x-1 transition-all mr-2" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-theme-text">No products matched your search.</p>
                <p className="text-xs text-theme-muted mt-1 max-w-sm mx-auto leading-relaxed">
                  Try checking your spelling, using more general keywords, or explore our curated collections below.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigate('/hijab');
                    }}
                    className="bg-theme-accent text-theme-accent-contrast px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    View Hijabs
                  </button>
                  <button
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigate('/clothing/dresses');
                    }}
                    className="border border-theme-border text-theme-text px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-theme-accent/5 transition-colors"
                  >
                    View Dresses
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
