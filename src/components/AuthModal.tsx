import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    loginCustomer,
    registerCustomer,
    pendingCartItem
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginCustomer(email, password);
        if (!res.success) {
          setError(res.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }
      } else {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await registerCustomer(name, email, password);
        if (!res.success) {
          setError(res.message || 'Registration failed. Email may already be in use.');
          setLoading(false);
          return;
        }
      }
      // Successful auth: StoreContext automatically processes pendingCartItem and closes modal
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setAuthModalOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-theme-surface text-theme-text shadow-2xl border border-theme-border z-10 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-theme-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-theme-accent/10 flex items-center justify-center text-theme-accent">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-editorial">
                {mode === 'login' ? 'Sign In to Your Account' : 'Create an Atelier Account'}
              </h2>
              <p className="text-[11px] text-theme-muted">
                {pendingCartItem
                  ? `Required to add "${pendingCartItem.product.name}" to your bag`
                  : 'Access exclusive modest luxury curation & tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-theme-accent/10 text-theme-muted hover:text-theme-text transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pending Item Banner */}
        {pendingCartItem && (
          <div className="bg-theme-surface-subtle px-6 py-2.5 border-b border-theme-border/60 flex items-center gap-3">
            <img
              src={pendingCartItem.product.primaryImage}
              alt={pendingCartItem.product.name}
              className="w-9 h-12 object-cover border border-theme-border shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-theme-accent uppercase font-bold tracking-widest block">
                Reserved in Session
              </span>
              <p className="text-xs font-medium truncate text-theme-text">
                {pendingCartItem.product.name}
              </p>
              <p className="text-[11px] text-theme-muted">
                {pendingCartItem.selectedColor} / {pendingCartItem.selectedSize} · Qty: {pendingCartItem.quantity}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-none">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs uppercase font-medium tracking-wider text-theme-muted mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sophia Laurent"
                  className="w-full bg-theme-surface-subtle border border-theme-border px-3.5 py-2.5 text-xs text-theme-text placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                />
                <UserIcon className="w-4 h-4 text-theme-muted/60 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-medium tracking-wider text-theme-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@needle.com"
                className="w-full bg-theme-surface-subtle border border-theme-border px-3.5 py-2.5 text-xs text-theme-text placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
              />
              <Mail className="w-4 h-4 text-theme-muted/60 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-medium tracking-wider text-theme-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-theme-surface-subtle border border-theme-border px-3.5 py-2.5 text-xs text-theme-text placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
              />
              <Lock className="w-4 h-4 text-theme-muted/60 absolute right-3.5 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs uppercase font-medium tracking-wider text-theme-muted mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-theme-surface-subtle border border-theme-border px-3.5 py-2.5 text-xs text-theme-text placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-accent transition-colors"
                />
                <Lock className="w-4 h-4 text-theme-muted/60 absolute right-3.5 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-theme-accent text-theme-accent-contrast py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In & Add to Bag' : 'Register & Add to Bag'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="px-6 py-3.5 bg-theme-surface-subtle border-t border-theme-border text-center text-xs text-theme-muted">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-theme-accent font-bold hover:underline ml-1"
              >
                Create an Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-theme-accent font-bold hover:underline ml-1"
              >
                Sign In Instead
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
