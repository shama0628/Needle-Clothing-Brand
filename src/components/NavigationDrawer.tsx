import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import { INITIAL_CMS_DATA } from '../data/cmsData';

export const NavigationDrawer: React.FC = () => {
  const { navDrawerOpen, setNavDrawerOpen } = useStore();
  const { isDark } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setNavDrawerOpen(false);
    setExpandedSection(null);
  }, [location.pathname, setNavDrawerOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navDrawerOpen) {
        setNavDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navDrawerOpen, setNavDrawerOpen]);

  if (!navDrawerOpen) return null;

  const toggleSubmenu = (label: string) => {
    setExpandedSection(prev => (prev === label ? null : label));
  };

  const logoSrc = isDark
    ? '/assets/logo/logo-light.png'
    : '/assets/logo/logo-dark.png';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setNavDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-theme-surface text-theme-text h-full shadow-2xl flex flex-col z-10 overflow-y-auto border-r border-theme-border">
        {/* Drawer Header */}
        <div className="p-6 border-b border-theme-border flex items-center justify-between">
          <Link to="/" onClick={() => setNavDrawerOpen(false)}>
            <img
              src={logoSrc}
              alt="NEEDLE"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setNavDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-theme-accent/10 text-theme-text transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 px-6 py-6 space-y-1">

          {/* HIJAB */}
          <div className="border-b border-theme-border/50 py-1">
            <button
              onClick={() => toggleSubmenu('HIJAB')}
              className="w-full flex items-center justify-between py-3 text-sm font-semibold tracking-editorial uppercase text-theme-text hover:text-theme-muted transition-colors"
            >
              <span>Hijab</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedSection === 'HIJAB' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'HIJAB' && (
              <div className="pl-4 pb-3 pt-1 space-y-2.5 text-xs tracking-wider uppercase border-l-2 border-theme-border ml-2">
                <Link
                  to="/hijab/classical-jersey"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Classical Jersey Hijab
                </Link>
                <Link
                  to="/hijab/printed-modal"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Printed Modal
                </Link>
                <Link
                  to="/hijab/plain-modal"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Plain Modal
                </Link>
                <Link
                  to="/hijab/partywear"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Partywear Hijabs
                </Link>
                <Link
                  to="/hijab"
                  className="block py-1 font-bold text-theme-text hover:underline"
                >
                  View All Hijabs →
                </Link>
              </div>
            )}
          </div>

          {/* CLOTHING */}
          <div className="border-b border-theme-border/50 py-1">
            <button
              onClick={() => toggleSubmenu('CLOTHING')}
              className="w-full flex items-center justify-between py-3 text-sm font-semibold tracking-editorial uppercase text-theme-text hover:text-theme-muted transition-colors"
            >
              <span>Clothing</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedSection === 'CLOTHING' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'CLOTHING' && (
              <div className="pl-4 pb-3 pt-1 space-y-2.5 text-xs tracking-wider uppercase border-l-2 border-theme-border ml-2">
                <Link
                  to="/clothing/dresses"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Dresses
                </Link>
                <Link
                  to="/clothing/coord-sets"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Co-ord Sets
                </Link>
                <Link
                  to="/clothing/tops"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Tops
                </Link>
                <Link
                  to="/clothing/skirts"
                  className="block py-1 text-theme-muted hover:text-theme-text transition-colors"
                >
                  Skirts
                </Link>
                <Link
                  to="/clothing"
                  className="block py-1 font-bold text-theme-text hover:underline"
                >
                  View All Clothing →
                </Link>
              </div>
            )}
          </div>

          {/* ACCESSORIES (Part D Consolidated) */}
          <Link
            to="/accessories"
            className="block py-3 text-sm font-semibold tracking-editorial uppercase text-theme-text hover:text-theme-accent transition-colors border-b border-theme-border/50"
          >
            Accessories
          </Link>

          {/* FIND YOUR COLORS */}
          <Link
            to="/find-your-colors"
            className="flex items-center justify-between py-3 text-sm font-semibold tracking-editorial uppercase text-theme-text hover:text-theme-muted transition-colors group border-b border-theme-border/50"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-theme-accent group-hover:scale-110 transition-transform" />
              Find Your Colors
            </span>
            <span className="text-[10px] tracking-widest bg-theme-accent text-theme-accent-contrast px-2 py-0.5 rounded-full font-bold">
              QUIZ
            </span>
          </Link>

          {/* DIVIDER */}
          <div className="py-4">
            <div className="h-px bg-theme-border w-full" />
          </div>

          {/* UTILITY LINKS */}
          <div className="space-y-2.5 text-xs tracking-wider uppercase text-theme-muted">
            <Link to="/about" className="block py-1 hover:text-theme-text transition-colors">
              About Needle
            </Link>
            <Link to="/contact" className="block py-1 hover:text-theme-text transition-colors">
              Contact
            </Link>
            <Link to="/size-guide" className="block py-1 hover:text-theme-text transition-colors">
              Size Guide
            </Link>
            <Link to="/shipping-returns" className="block py-1 hover:text-theme-text transition-colors">
              Shipping & Returns
            </Link>
            <Link to="/faq" className="block py-1 hover:text-theme-text transition-colors">
              FAQ
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 bg-theme-surface-subtle border-t border-theme-border text-center">
          <p className="text-xs uppercase tracking-editorial text-theme-text font-semibold">
            {INITIAL_CMS_DATA.brand.tagline}
          </p>
          <p className="text-[11px] text-theme-muted mt-1">
            © {new Date().getFullYear()} NEEDLE Atelier. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
