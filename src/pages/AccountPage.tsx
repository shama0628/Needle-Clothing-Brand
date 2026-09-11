import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, Settings, LogOut, CheckCircle2, Clock, Truck, ShieldCheck, ChevronRight, X, Lock, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const AccountPage: React.FC = () => {
  const {
    user,
    orders,
    wishlist,
    loginCustomer,
    registerCustomer,
    logoutUser,
    updateUser,
    requestReturn,
    updateOrderStatus
  } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'settings'>('orders');

  // Return modal state
  const [returnModalOrder, setReturnModalOrder] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState<any>('wrong_size');
  const [returnNote, setReturnNote] = useState('');
  const [returnResolution, setReturnResolution] = useState<any>('refund');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Edit profile form
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Auth form state (when unauthenticated)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ firstName, lastName, phone });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await loginCustomer(loginEmail, loginPassword);
        if (!res.success) {
          setAuthError(res.message || 'Invalid email or password.');
        }
      } else {
        if (!regName.trim()) {
          setAuthError('Please enter your full name.');
          setAuthLoading(false);
          return;
        }
        if (regPassword.length < 6) {
          setAuthError('Password must be at least 6 characters.');
          setAuthLoading(false);
          return;
        }
        if (regPassword !== regConfirmPassword) {
          setAuthError('Passwords do not match.');
          setAuthLoading(false);
          return;
        }
        const res = await registerCustomer(regName, regEmail, regPassword);
        if (!res.success) {
          setAuthError(res.message || 'Registration failed. Email may already be in use.');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // If not logged in, show real login / register tabs
  if (!user) {
    return (
      <div className="pt-32 min-h-screen bg-theme-bg text-theme-text pb-24 px-4">
        <div className="max-w-md mx-auto bg-theme-surface border border-theme-border p-8 sm:p-10 shadow-lg text-left space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-theme-accent/10 mx-auto flex items-center justify-center text-theme-accent mb-2">
              <User className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-editorial text-theme-muted block">
              Atelier Client Portal
            </span>
            <h1 className="text-2xl font-light tracking-tight text-theme-text">
              {authMode === 'login' ? 'Sign In to NEEDLE' : 'Create Atelier Account'}
            </h1>
            <p className="text-xs text-theme-muted font-light leading-relaxed">
              {authMode === 'login'
                ? 'Access your orders, saved addresses, and tailored modest luxury curation.'
                : 'Join the NEEDLE Atelier for dedicated order tracking and color theory palettes.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border border-theme-border p-1 bg-theme-surface-secondary">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                authMode === 'login'
                  ? 'bg-theme-surface text-theme-text shadow-sm'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                authMode === 'register'
                  ? 'bg-theme-surface text-theme-text shadow-sm'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-theme-muted uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Zainab Siddiqui"
                    className="w-full bg-theme-bg border border-theme-border pl-10 pr-3 py-2.5 text-xs text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-text transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-theme-muted uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={authMode === 'login' ? loginEmail : regEmail}
                  onChange={e => authMode === 'login' ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-theme-bg border border-theme-border pl-10 pr-3 py-2.5 text-xs text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-text transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-theme-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={authMode === 'login' ? loginPassword : regPassword}
                  onChange={e => authMode === 'login' ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-theme-bg border border-theme-border pl-10 pr-3 py-2.5 text-xs text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-text transition-colors"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-theme-muted uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-theme-bg border border-theme-border pl-10 pr-3 py-2.5 text-xs text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-text transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-theme-accent text-theme-accent-contrast py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In to NEEDLE' : 'Create Atelier Account')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[11px] text-theme-muted text-center pt-2">
            Secure PostgreSQL transactional authentication • Needle Atelier
          </p>
        </div>
      </div>
    );
  }

  const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-theme-border mb-10 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-editorial text-theme-muted block mb-1">
              Client Portal
            </span>
            <h1 className="text-3xl font-light tracking-tight text-theme-text">
              Welcome, {user.firstName}
            </h1>
            <p className="text-xs text-theme-muted font-light mt-0.5">
              Member of Needle Atelier since {user.memberSince}
            </p>
          </div>

          <button
            onClick={logoutUser}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-theme-muted hover:text-theme-text uppercase tracking-wider font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tabbed Portal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                activeTab === 'orders'
                  ? 'bg-theme-accent text-theme-accent-contrast'
                  : 'bg-transparent text-theme-text hover:bg-theme-accent/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Orders ({orders.length})</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-theme-accent text-theme-accent-contrast'
                  : 'bg-transparent text-theme-text hover:bg-theme-accent/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist ({wishlist.length})</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                activeTab === 'profile'
                  ? 'bg-theme-accent text-theme-accent-contrast'
                  : 'bg-transparent text-theme-text hover:bg-theme-accent/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>Profile Details</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-theme-accent text-theme-accent-contrast'
                  : 'bg-transparent text-theme-text hover:bg-theme-accent/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-between transition-colors ${
                activeTab === 'settings'
                  ? 'bg-theme-accent text-theme-accent-contrast'
                  : 'bg-transparent text-theme-text hover:bg-theme-accent/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </aside>

          {/* Tab Content Panel */}
          <main className="lg:col-span-9 bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-sm min-h-[450px]">
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-light tracking-tight text-theme-text">
                    Order History & Deliveries
                  </h2>
                  <p className="text-xs text-theme-muted font-light mt-1">
                    Real-time status updates and parcel tracking for your atelier purchases.
                  </p>
                </div>

                {orders
                  .filter(o => !user || o.customer.email.toLowerCase() === user.email.toLowerCase() || o.customer.name.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase())
                  .length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-xs text-theme-muted">No orders placed yet.</p>
                    <Link
                      to="/shop"
                      className="mt-4 inline-block bg-theme-accent text-theme-accent-contrast px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {orders
                      .filter(o => !user || o.customer.email.toLowerCase() === user.email.toLowerCase() || o.customer.name.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase())
                      .map(ord => {
                        const activeReturn = ord.returnRequests && ord.returnRequests.length > 0 ? ord.returnRequests[0] : null;

                        return (
                          <div
                            key={ord.id}
                            className="p-6 border border-theme-border bg-theme-surface-secondary space-y-6"
                          >
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-theme-border text-xs">
                              <div>
                                <span className="font-bold text-theme-text uppercase tracking-wider">
                                  Order #{ord.orderNumber}
                                </span>
                                <span className="text-theme-muted ml-3">Placed on {ord.date}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-theme-text">
                                  Total: ₹{ord.total.toLocaleString('en-IN')}
                                </span>
                                <span className="bg-theme-accent text-theme-accent-contrast px-2.5 py-0.5 uppercase tracking-wider text-[10px] font-bold">
                                  {ord.status}
                                </span>
                                {activeReturn && (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 uppercase tracking-wider text-[9px] font-bold rounded">
                                    Return: {activeReturn.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Order Status Timeline */}
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-theme-muted mb-3">
                                Delivery Journey
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-medium">
                                <div className="flex flex-col items-center">
                                  <div className="w-7 h-7 rounded-full bg-theme-accent text-theme-accent-contrast flex items-center justify-center mb-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <span className="text-theme-text">Placed</span>
                                </div>

                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                                    ['processing', 'packed', 'shipped', 'delivered'].includes(ord.status)
                                      ? 'bg-theme-accent text-theme-accent-contrast'
                                      : 'bg-theme-surface-subtle text-theme-muted'
                                  }`}>
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <span className={['processing', 'packed', 'shipped', 'delivered'].includes(ord.status) ? 'text-theme-text' : 'text-theme-muted'}>
                                    Atelier Prep
                                  </span>
                                </div>

                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                                    ['shipped', 'delivered'].includes(ord.status)
                                      ? 'bg-theme-accent text-theme-accent-contrast'
                                      : 'bg-theme-surface-subtle text-theme-muted'
                                  }`}>
                                    <Truck className="w-4 h-4" />
                                  </div>
                                  <span className={['shipped', 'delivered'].includes(ord.status) ? 'text-theme-text' : 'text-theme-muted'}>
                                    In Transit
                                  </span>
                                </div>

                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                                    ord.status === 'delivered'
                                      ? 'bg-theme-accent text-theme-accent-contrast'
                                      : 'bg-theme-surface-subtle text-theme-muted'
                                  }`}>
                                    <ShieldCheck className="w-4 h-4" />
                                  </div>
                                  <span className={ord.status === 'delivered' ? 'text-theme-text' : 'text-theme-muted'}>
                                    Delivered
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Carrier & Tracking Reference */}
                            {ord.trackingNumber && (
                              <div className="p-3 bg-theme-surface-subtle rounded border border-theme-border text-xs flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-theme-text" />
                                  <span>Courier: <strong>{ord.carrier || 'Blue Dart Express'}</strong> — Tracking #{ord.trackingNumber}</span>
                                </div>
                                <span className="text-[10px] text-theme-muted uppercase font-semibold">Verified Parcel</span>
                              </div>
                            )}

                            {/* Items in this order */}
                            <div className="space-y-3 pt-2">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-theme-surface p-3 border border-theme-border">
                                  <img
                                    src={item.primaryImage}
                                    alt={item.productName}
                                    className="w-12 h-16 object-cover bg-theme-surface-subtle"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-theme-text truncate">
                                      {item.productName}
                                    </p>
                                    <p className="text-[11px] text-theme-muted">
                                      {item.color} • {item.size} • Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <span className="text-xs font-semibold text-theme-text">
                                    ₹{item.totalPrice.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Customer Actions: Cancel or Return */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-theme-border">
                              {['placed', 'confirmed', 'processing'].includes(ord.status) && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to cancel order #${ord.orderNumber}?`)) {
                                      updateOrderStatus(ord.id, 'cancelled', undefined, undefined, 'Client Account Portal');
                                    }
                                  }}
                                  className="px-3.5 py-1.5 border border-theme-border text-theme-muted hover:text-theme-text hover:border-theme-text text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                                >
                                  Cancel Order
                                </button>
                              )}

                              {ord.status === 'delivered' && !activeReturn && (
                                <button
                                  onClick={() => {
                                    setReturnModalOrder(ord);
                                    setReturnReason('wrong_size');
                                    setReturnNote('');
                                  }}
                                  className="px-4 py-2 bg-theme-accent text-theme-accent-contrast text-xs font-semibold uppercase tracking-wider rounded hover:opacity-90 transition-opacity shadow-xs"
                                >
                                  Request Return
                                </button>
                              )}

                              {activeReturn && (
                                <div className="text-xs text-theme-text flex flex-wrap items-center gap-2">
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    activeReturn.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : activeReturn.status === 'rejected'
                                      ? 'bg-rose-100 text-rose-900'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    RMA: {activeReturn.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-[11px] text-theme-muted italic">
                                    {activeReturn.status === 'requested' && 'Under review by atelier concierge.'}
                                    {activeReturn.status === 'approved' && 'Approved. Please dispatch item with return slip.'}
                                    {activeReturn.status === 'in_transit' && 'Parcel in transit to atelier warehouse.'}
                                    {activeReturn.status === 'received' && 'Parcel received — undergoing fabric & stitch inspection.'}
                                    {activeReturn.status === 'inspected' && 'Inspection complete — executing final resolution.'}
                                    {activeReturn.status === 'completed' && 'Return and resolution completed.'}
                                    {activeReturn.status === 'rejected' && 'Return request could not be accepted.'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-light tracking-tight text-theme-text">
                    Saved Creations ({wishlist.length})
                  </h2>
                  <p className="text-xs text-theme-muted font-light mt-1">
                    Your personal curation of pieces saved for upcoming moments.
                  </p>
                </div>

                {wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {wishlistProducts.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Heart className="w-8 h-8 text-theme-muted/40 mx-auto mb-3" />
                    <p className="text-xs text-theme-muted font-light">Your wishlist is currently empty.</p>
                    <Link
                      to="/clothing/dresses"
                      className="mt-4 inline-block bg-theme-accent text-theme-accent-contrast px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                      Browse Dresses
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-6 max-w-lg">
                <div>
                  <h2 className="text-xl font-light tracking-tight text-theme-text">
                    Profile Information
                  </h2>
                  <p className="text-xs text-theme-muted font-light mt-1">
                    Manage your personal concierge and contact details.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-theme-muted mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full bg-theme-bg border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-theme-muted mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full bg-theme-bg border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-theme-muted mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-theme-surface-subtle border border-theme-border px-3 py-2 text-xs text-theme-muted cursor-not-allowed"
                  />
                  <p className="text-[10px] text-theme-muted mt-1">To update your login email, please contact concierge.</p>
                </div>

                <div>
                  <label className="block text-xs text-theme-muted mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-text"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-theme-accent text-theme-accent-contrast px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Save Profile
                </button>
              </form>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-light tracking-tight text-theme-text">
                    Saved Shipping Addresses
                  </h2>
                  <p className="text-xs text-theme-muted font-light mt-1">
                    Addresses saved for seamless, 1-click checkout.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.savedAddresses.map((addr, idx) => (
                    <div key={idx} className="p-5 border border-theme-border bg-theme-surface space-y-2 relative">
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 bg-theme-accent text-theme-accent-contrast text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                          Default
                        </span>
                      )}
                      <p className="text-xs font-semibold text-theme-text">{addr.firstName} {addr.lastName}</p>
                      <p className="text-xs text-theme-muted font-light">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-xs text-theme-muted font-light">{addr.addressLine2}</p>}
                      <p className="text-xs text-theme-muted font-light">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-xs text-theme-muted font-light">{addr.country}</p>
                      <p className="text-xs text-theme-muted font-light pt-1">{addr.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <h2 className="text-xl font-light tracking-tight text-theme-text">
                    Account Preferences
                  </h2>
                  <p className="text-xs text-theme-muted font-light mt-1">
                    Notifications and communication preferences.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 p-3 bg-theme-surface-secondary border border-theme-border cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-theme-accent mt-0.5" />
                    <div>
                      <strong className="block font-semibold text-theme-text">Editorial Lookbooks & Previews</strong>
                      <span className="text-theme-muted font-light">Receive early access to seasonal silk and modal drops.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-theme-surface-secondary border border-theme-border cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-theme-accent mt-0.5" />
                    <div>
                      <strong className="block font-semibold text-theme-text">Order SMS Tracking</strong>
                      <span className="text-theme-muted font-light">Direct dispatch and courier milestone alerts on your mobile.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Return Request Modal (Doc 03 Section 15) */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-theme-surface max-w-md w-full border border-theme-border p-6 sm:p-8 space-y-5 shadow-2xl text-theme-text">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-editorial text-theme-muted block">
                  Atelier Concierge Return
                </span>
                <h3 className="text-base font-serif font-bold text-theme-text">
                  Return Order #{returnModalOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="p-1 text-theme-muted hover:text-theme-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setReturnSubmitting(true);
                try {
                  requestReturn(returnModalOrder.id, returnReason, returnNote, returnResolution);
                  setReturnModalOrder(null);
                } finally {
                  setReturnSubmitting(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1 text-theme-text">Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value as any)}
                  className="w-full bg-theme-bg border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-text"
                  required
                >
                  <option value="wrong_size">Size did not fit as expected</option>
                  <option value="color_mismatch">Color differed from screen display</option>
                  <option value="damaged_item">Item arrived damaged in transit</option>
                  <option value="defective_fabric">Fabric weave or stitching irregularity</option>
                  <option value="changed_mind">Changed mind / No longer required</option>
                  <option value="other">Other bespoke reason</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-theme-text">Preferred Resolution *</label>
                <select
                  value={returnResolution}
                  onChange={e => setReturnResolution(e.target.value as any)}
                  className="w-full bg-theme-bg border border-theme-border px-3 py-2 text-xs text-theme-text focus:outline-none focus:border-theme-text"
                  required
                >
                  <option value="refund">Refund to original payment card / method</option>
                  <option value="exchange">Exchange for alternative size/color</option>
                  <option value="store_credit">Atelier Store Credit (Instant)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-theme-text">Customer Explanation (Optional)</label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={e => setReturnNote(e.target.value)}
                  placeholder="Provide any additional fitting or quality notes for the atelier inspection team..."
                  className="w-full bg-theme-bg border border-theme-border p-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-text"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="px-4 py-2 text-theme-muted hover:text-theme-text font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="px-5 py-2.5 bg-theme-accent text-theme-accent-contrast font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {returnSubmitting ? 'Submitting...' : 'Confirm Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
