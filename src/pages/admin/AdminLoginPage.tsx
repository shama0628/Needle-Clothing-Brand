import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to destination
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Empty field validation
    if (!loginId.trim()) {
      setError('Please enter your Admin Login ID or Email.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(loginId, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Invalid administrator credentials. Please check your login ID and password.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F141B] text-beige flex flex-col justify-center items-center p-4 relative antialiased">
      {/* Background subtle atmospheric glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-plum/30 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-beige text-plum font-serif text-2xl font-bold mb-3 shadow-lg">
            N
          </div>
          <h1 className="font-serif tracking-widest text-2xl uppercase text-beige font-light">
            NEEDLE
          </h1>
          <p className="text-xs text-beige/60 uppercase tracking-editorial mt-1">
            Atelier Management Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center pb-2">
              <h2 className="text-base font-medium text-beige">Administrator Authentication</h2>
              <p className="text-xs text-beige/60 mt-0.5">
                Enter authorized atelier credentials to access management console
              </p>
            </div>

            {/* Login ID / Email */}
            <div>
              <label className="block text-xs font-medium text-beige/80 mb-1.5">
                Admin Login ID / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-beige/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={loginId}
                  onChange={e => {
                    setLoginId(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder="Enter administrator ID"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-black/30 border border-white/10 rounded-xl text-beige placeholder:text-beige/30 focus:outline-none focus:ring-2 focus:ring-beige/30 disabled:opacity-50"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-beige/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-beige/40 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-black/30 border border-white/10 rounded-xl text-beige placeholder:text-beige/30 focus:outline-none focus:ring-2 focus:ring-beige/30 disabled:opacity-50"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-beige/40 hover:text-beige transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-beige text-plum py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-beige/90 transition-all flex items-center justify-center gap-2 shadow-lg mt-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Link back to storefront */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-beige/60 hover:text-beige transition-colors inline-flex items-center gap-1.5"
          >
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
