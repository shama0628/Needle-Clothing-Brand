import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Heart, User, ShoppingBag, Sun, Moon } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const {
    cartCount,
    wishlist,
    setNavDrawerOpen,
    setCartDrawerOpen,
    setSearchModalOpen
  } = useStore();

  const { theme, isDark, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      // Trigger header appearance on scroll down from hero
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize immediately
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Logo asset selection: transparent logo adapted to current theme
  const logoSrc = isDark
    ? '/assets/logo/logo-light.png'
    : '/assets/logo/logo-dark.png';

  // Navigation items per Part C
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Dresses', path: '/clothing/dresses' },
    { label: 'Hijabs', path: '/hijab' },
    { label: 'Co-ord Sets', path: '/clothing/coord-sets' },
    { label: 'Accessories', path: '/accessories' },
    { label: 'Color Theory', path: '/find-your-colors' }
  ];

  // The main NEEDLE header is visible immediately when homepage loads (never hidden)
  // When scrolling, subtle padding and shadow transitions give clean luxury polish
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-theme-surface/98 dark:bg-[#191016]/98 backdrop-blur-md border-b border-theme-border shadow-sm py-2.5'
          : 'bg-theme-surface/95 dark:bg-[#191016]/95 backdrop-blur-md border-b border-theme-border/70 py-3 sm:py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Desktop Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setNavDrawerOpen(true)}
            className="p-2 rounded-full transition-colors flex items-center gap-2 group text-theme-text hover:bg-theme-accent/10"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 transition-transform group-hover:scale-105" />
            <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-widest text-theme-text">
              Menu
            </span>
          </button>

          {/* NEEDLE Logo: completely transparent, blends cleanly */}
          <Link to="/" className="inline-flex items-center transition-opacity hover:opacity-90">
            <img
              src={logoSrc}
              alt="NEEDLE - Stitching your Story"
              className="h-8 sm:h-9 w-auto object-contain transition-all duration-300"
            />
          </Link>
        </div>

        {/* Center: Top-Level Storefront Navigation (Part C) */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map(link => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs uppercase tracking-editorial font-medium transition-all relative py-1 hover:text-theme-accent ${
                  isActive
                    ? 'text-theme-text font-bold'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-accent rounded-full animate-fadeIn" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Theme Toggle, Search, Wishlist, Account, Shopping Bag) */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Part H: Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors text-theme-text hover:bg-theme-accent/10"
            aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-theme-text transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-full transition-colors text-theme-text hover:bg-theme-accent/10"
            aria-label="Search Collection"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="p-2 rounded-full transition-colors relative text-theme-text hover:bg-theme-accent/10"
            aria-label="Saved Items"
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 bg-theme-accent text-theme-accent-contrast text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            to="/account"
            className="p-2 rounded-full transition-colors text-theme-text hover:bg-theme-accent/10"
            aria-label="My Account"
          >
            <User className="w-4.5 h-4.5" />
          </Link>

          {/* Shopping Bag */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="p-2 rounded-full transition-colors relative flex items-center gap-1.5 text-theme-text hover:bg-theme-accent/10"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="bg-theme-accent text-theme-accent-contrast text-[10px] font-bold rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
