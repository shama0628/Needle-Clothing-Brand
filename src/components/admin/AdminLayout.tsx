import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  FolderTree,
  ShoppingCart,
  Users,
  Palette,
  UserCheck,
  ScrollText,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';

export const AdminLayout: React.FC = () => {
  const { currentAdmin, logout } = useAdmin();
  const { products, orders } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Operational badges
  const lowStockCount = products.filter(p => p.stockCount <= 10 && p.status !== 'archived').length;
  const activeOrdersCount = orders.filter(o => o.status === 'placed' || o.status === 'processing').length;

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true
    },
    {
      to: '/admin/products',
      label: 'Products',
      icon: Package,
      badge: `${products.length}`
    },
    {
      to: '/admin/inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      to: '/admin/cms',
      label: 'Homepage CMS',
      icon: Layers
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      icon: FolderTree
    },
    {
      to: '/admin/orders',
      label: 'Orders Queue',
      icon: ShoppingCart,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : undefined,
      badgeColor: 'bg-plum text-beige'
    },
    {
      to: '/admin/customers',
      label: 'Customers',
      icon: Users
    },
    {
      to: '/admin/color-theory',
      label: 'Color Theory CMS',
      icon: Palette
    },
    {
      to: '/admin/users',
      label: 'Admin Staff',
      icon: UserCheck
    },
    {
      to: '/admin/audit-logs',
      label: 'Audit Trail',
      icon: ScrollText
    },
    {
      to: '/admin/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-charcoal flex flex-col md:flex-row antialiased">
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-plum text-beige shrink-0 border-r border-plum/30 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-beige/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-beige text-plum flex items-center justify-center font-serif text-lg font-bold">
              N
            </div>
            <div>
              <span className="font-serif tracking-widest text-base uppercase block text-beige leading-tight">
                NEEDLE
              </span>
              <span className="text-[10px] tracking-editorial uppercase text-beige/60 font-mono block">
                Management System
              </span>
            </div>
          </div>
        </div>

        {/* Current Admin Profile Card */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-black/20 border border-white/5">
          <div className="flex items-center gap-3">
            <img
              src={currentAdmin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
              alt={currentAdmin?.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-beige/30"
            />
            <div className="overflow-hidden">
              <span className="text-xs font-medium text-beige block truncate">
                {currentAdmin?.name || 'Administrator'}
              </span>
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
                Admin Role
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-beige text-plum font-semibold shadow-sm'
                      : 'text-beige/80 hover:bg-white/5 hover:text-beige'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-plum text-beige'
                          : item.badgeColor || 'bg-white/10 text-beige'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-beige/10 space-y-1">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-beige/70 hover:text-beige hover:bg-white/5 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </div>
            <span className="text-[10px] text-beige/40 group-hover:text-beige/60">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden bg-plum text-beige px-4 py-3.5 flex items-center justify-between border-b border-plum/30 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-beige hover:bg-white/20"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif tracking-widest text-sm uppercase text-beige font-semibold">
            NEEDLE CMS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-white/10 text-rose-300 hover:bg-white/20 text-xs flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
          <Link
            to="/"
            className="p-1.5 rounded-lg bg-white/10 text-beige hover:bg-white/20 text-xs flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-plum text-beige flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-beige/10 mb-4">
            <span className="font-serif tracking-widest text-lg uppercase text-beige font-bold">
              NEEDLE CMS
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 text-beige"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-3 rounded-lg bg-black/20 border border-white/5">
            <span className="text-xs text-beige block font-medium">{currentAdmin?.name}</span>
            <span className="text-[10px] text-sky-300 uppercase">Administrator</span>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-beige/90 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-beige/10 space-y-2 mt-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs text-beige/70 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Customer Storefront</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-rose-300 py-2 w-full text-left font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white border-b border-sand/40 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-charcoal/60">
              <span className="font-medium text-charcoal">Atelier Admin</span>
              <span>/</span>
              <span className="capitalize text-plum font-semibold">
                {location.pathname.split('/')[2] || 'Dashboard'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Admin Session Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Direct Switch to Customer Storefront */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-plum bg-sand/30 hover:bg-sand/60 rounded-md border border-sand/60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>

            {/* Logout button in top bar */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-sand/20 transition-colors cursor-pointer"
              >
                <img
                  src={currentAdmin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                  alt={currentAdmin?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-plum/20"
                />
                <ChevronDown className="w-3.5 h-3.5 text-charcoal/60" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-sand/60 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-sand/30">
                    <p className="text-xs font-semibold text-charcoal truncate">{currentAdmin?.name}</p>
                    <p className="text-[11px] text-charcoal/60 truncate">{currentAdmin?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-plum/10 text-plum">
                      Admin
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/admin/audit-logs"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-4 py-2 text-left text-xs text-charcoal hover:bg-sand/20 flex items-center justify-between"
                    >
                      <span>Audit Logs</span>
                      <ScrollText className="w-3.5 h-3.5 text-charcoal/50" />
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-sand/30">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center justify-between cursor-pointer"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
