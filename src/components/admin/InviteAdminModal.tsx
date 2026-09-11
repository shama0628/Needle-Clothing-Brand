import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface InviteAdminModalProps {
  onClose: () => void;
}

export const InviteAdminModal: React.FC<InviteAdminModalProps> = ({ onClose }) => {
  const { inviteAdminUser } = useAdmin();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    const res = inviteAdminUser(name, email);
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-sand shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand/40 flex items-center justify-between bg-sand/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-plum text-beige flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Invite Staff Member</h3>
              <p className="text-[11px] text-charcoal/60">Add authorized administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-sand/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Fatima Zahra"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/80 mb-1.5">
              Work Email Address
            </label>
            <input
              type="email"
              placeholder="fatima@needle.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-white"
              required
            />
          </div>

          <div className="p-3 bg-sand/20 rounded-xl border border-sand/50 text-[11px] text-charcoal/70 leading-relaxed">
            Staff account will be created with standard administrator access across the product catalog, order queue, and content management.
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-charcoal/70 hover:bg-sand/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-beige bg-plum hover:bg-plum/90 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Send Staff Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
