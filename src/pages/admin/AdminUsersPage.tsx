import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Power,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { InviteAdminModal } from '../../components/admin/InviteAdminModal';

export const AdminUsersPage: React.FC = () => {
  const { adminUsers, currentAdmin, toggleUserStatus, forcePasswordReset } = useAdmin();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleStatus = (userId: string, name: string) => {
    toggleUserStatus(userId);
    showNotice(`Updated active status for ${name}`);
  };

  const handleResetPassword = (userId: string, name: string) => {
    forcePasswordReset(userId);
    showNotice(`Dispatched secure one-time password reset token to ${name}'s email.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Admin Staff & Access Control
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 14 • Manage administrator accounts, invitations, and session access.
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="bg-plum text-beige hover:bg-plum/90 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Admin</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal">
            <thead className="bg-sand/20 text-charcoal/70 uppercase tracking-wider text-[10px] font-semibold border-b border-sand/40">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Last Active</th>
                <th className="py-3.5 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {adminUsers.map(user => {
                const isSelf = currentAdmin?.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-sand/10 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-sand shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-charcoal">{user.name}</h4>
                            {isSelf && (
                              <span className="text-[9px] font-bold text-plum bg-plum/10 px-1.5 py-0.2 rounded">
                                Active Session
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-charcoal/60">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-300">
                        Admin
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{user.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-charcoal/60 text-[11px]">
                      {user.lastLogin}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Reset password button */}
                        <button
                          onClick={() => handleResetPassword(user.id, user.name)}
                          className="p-1.5 text-charcoal/50 hover:text-plum hover:bg-sand/30 rounded-lg transition-colors cursor-pointer"
                          title="Force Password Reset"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {/* Deactivate button */}
                        {!isSelf && (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.name)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.status === 'active'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'active' ? 'Deactivate account' : 'Reactivate account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <InviteAdminModal
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </div>
  );
};
