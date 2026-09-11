import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, CheckCircle2 } from 'lucide-react';
import { INITIAL_CMS_DATA } from '../data/cmsData';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const logoSrc = isDark ? '/assets/logo/logo-light.png' : '/assets/logo/logo-dark.png';

  return (
    <footer className="bg-theme-surface text-theme-text border-t border-theme-border pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-theme-border">
          <div className="lg:col-span-5 space-y-4">
            <img
              src={logoSrc}
              alt="NEEDLE"
              className="h-10 w-auto object-contain"
            />
            <p className="text-sm text-theme-muted max-w-md leading-relaxed font-light">
              {INITIAL_CMS_DATA.brand.manifesto}
            </p>
            <p className="text-xs uppercase tracking-editorial text-theme-text font-semibold pt-2">
              “{INITIAL_CMS_DATA.brand.tagline}”
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase tracking-editorial font-bold text-theme-text mb-2">
                The Atelier Newsletter
              </h4>
              <p className="text-sm text-theme-muted font-light mb-5">
                Receive private invitations to seasonal trunk shows, editorial capsules, and tailored color discoveries.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-sm text-theme-text bg-theme-surface-subtle px-4 py-3 border border-theme-border rounded-none">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Thank you for joining. Welcome to the Needle story.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-md">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-theme-surface-subtle border border-theme-border px-4 py-3 text-sm text-theme-text placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-theme-accent text-theme-accent-contrast px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12 text-sm font-light">
          {/* Shop */}
          <div>
            <h5 className="text-xs uppercase tracking-editorial font-bold text-theme-text mb-4">
              Shop Collections
            </h5>
            <ul className="space-y-2.5 text-theme-muted text-xs tracking-wide">
              <li>
                <Link to="/hijab" className="hover:text-theme-text transition-colors">
                  All Hijabs
                </Link>
              </li>
              <li>
                <Link to="/hijab/classical-jersey" className="hover:text-theme-text transition-colors">
                  Classical Jersey
                </Link>
              </li>
              <li>
                <Link to="/hijab/printed-modal" className="hover:text-theme-text transition-colors">
                  Printed Modal
                </Link>
              </li>
              <li>
                <Link to="/hijab/plain-modal" className="hover:text-theme-text transition-colors">
                  Plain Modal
                </Link>
              </li>
              <li>
                <Link to="/hijab/partywear" className="hover:text-theme-text transition-colors">
                  Partywear Hijabs
                </Link>
              </li>
              <li>
                <Link to="/clothing" className="hover:text-theme-text transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/clothing/dresses" className="hover:text-theme-text transition-colors">
                  Dresses
                </Link>
              </li>
              <li>
                <Link to="/clothing/coord-sets" className="hover:text-theme-text transition-colors">
                  Co-ord Sets
                </Link>
              </li>
              <li>
                <Link to="/accessories" className="hover:text-theme-text transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Color Theory */}
          <div>
            <h5 className="text-xs uppercase tracking-editorial font-bold text-theme-text mb-4">
              Color Discovery
            </h5>
            <ul className="space-y-2.5 text-theme-muted text-xs tracking-wide">
              <li>
                <Link to="/find-your-colors" className="hover:text-theme-text transition-colors">
                  Find Your Colors Quiz
                </Link>
              </li>
              <li>
                <Link to="/find-your-colors" className="hover:text-theme-text transition-colors">
                  Personalized Palette
                </Link>
              </li>
              <li>
                <Link to="/find-your-colors" className="hover:text-theme-text transition-colors">
                  Jewellery Guidance
                </Link>
              </li>
              <li>
                <Link to="/clothing/dresses" className="hover:text-theme-text transition-colors">
                  Editorial Lookbook
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Help */}
          <div>
            <h5 className="text-xs uppercase tracking-editorial font-bold text-theme-text mb-4">
              Client Care
            </h5>
            <ul className="space-y-2.5 text-theme-muted text-xs tracking-wide">
              <li>
                <Link to="/contact" className="hover:text-theme-text transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="hover:text-theme-text transition-colors">
                  Comprehensive Size Guide
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="hover:text-theme-text transition-colors">
                  Shipping & Deliveries
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="hover:text-theme-text transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-theme-text transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* About Needle */}
          <div>
            <h5 className="text-xs uppercase tracking-editorial font-bold text-theme-text mb-4">
              About NEEDLE
            </h5>
            <ul className="space-y-2.5 text-theme-muted text-xs tracking-wide">
              <li>
                <Link to="/about" className="hover:text-theme-text transition-colors">
                  Our Story & Philosophy
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-theme-text transition-colors">
                  Sustainable Textiles
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-theme-text transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-theme-text transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="col-span-2 sm:col-span-1">
            <h5 className="text-xs uppercase tracking-editorial font-bold text-theme-text mb-4">
              Connect
            </h5>
            <div className="flex items-center space-x-3 mb-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-theme-border flex items-center justify-center hover:bg-theme-accent hover:text-theme-accent-contrast transition-colors text-theme-text"
                aria-label="Needle on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <ul className="space-y-2 text-theme-muted text-xs tracking-wide">
              <li>
                <Link to="/privacy-policy" className="hover:text-theme-text transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-theme-text transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <span className="text-theme-muted/70">Secure 256-Bit SSL Checkout</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between text-xs text-theme-muted font-light gap-4">
          <p>© {new Date().getFullYear()} NEEDLE E-Commerce Storefront. All rights reserved.</p>
          <p className="tracking-widest uppercase text-[10px]">
            Designed according to Documentation 01 Specification
          </p>
        </div>
      </div>
    </footer>
  );
};
