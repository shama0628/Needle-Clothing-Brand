import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Eye,
  Calendar,
  Shield,
  FileCode,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AuditCategory, AuditLog } from '../../types/admin';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      (log.entityName && log.entityName.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 15 • Mandatory compliance record of administrative mutations, prices, stock and refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-plum text-beige px-3 py-1.5 rounded-xl shadow-xs">
            {auditLogs.length} Total Audit Records
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-sand/60 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action description, entity name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-sand/10"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-charcoal/60">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-sand/80 bg-white capitalize"
          >
            <option value="all">All Categories</option>
            <option value="product">Product Catalogue</option>
            <option value="price">Pricing & Discounts</option>
            <option value="stock">Inventory & Stock</option>
            <option value="order">Order Operations</option>
            <option value="refund">Refunds & Cancellations</option>
            <option value="cms">Homepage & CMS</option>
            <option value="user">Admin Users & Access</option>
            <option value="settings">System Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal">
            <thead className="bg-sand/20 text-charcoal/70 uppercase tracking-wider text-[10px] font-semibold border-b border-sand/40">
              <tr>
                <th className="py-3.5 px-4">Timestamp (UTC)</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Action Event</th>
                <th className="py-3.5 px-3">Entity Reference</th>
                <th className="py-3.5 px-3">Actor & Role</th>
                <th className="py-3.5 px-4 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-sand/10 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[11px] font-mono text-charcoal/60">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-plum/10 text-plum font-mono">
                      {log.category}
                    </span>
                  </td>

                  {/* Action & Details */}
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-charcoal block">{log.action}</span>
                    <p className="text-[11px] text-charcoal/60 line-clamp-1 max-w-sm">{log.details}</p>
                  </td>

                  {/* Entity */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {log.entityName ? (
                      <div>
                        <span className="font-medium text-charcoal block truncate max-w-[150px]">
                          {log.entityName}
                        </span>
                        <span className="text-[10px] text-charcoal/40 font-mono">{log.entityId}</span>
                      </div>
                    ) : (
                      <span className="text-charcoal/40 italic">System Global</span>
                    )}
                  </td>

                  {/* Actor */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-charcoal">{log.actorName}</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-sky-100 text-sky-900">
                        Admin
                      </span>
                    </div>
                  </td>

                  {/* Details Trigger */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {log.beforeAfter ? (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-sand/30 hover:bg-sand/70 text-plum text-[11px] font-semibold rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Diff</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-charcoal/40 hover:text-plum rounded-lg transition-colors inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Diff Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-sand shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand/40">
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-plum" />
                <h3 className="text-sm font-semibold text-charcoal">{selectedLog.action}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-charcoal/40 hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-sand/20 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Audit ID:</span>
                  <span className="font-mono text-charcoal font-semibold">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Timestamp:</span>
                  <span className="font-mono text-charcoal">{new Date(selectedLog.timestamp).toISOString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Staff Member:</span>
                  <span className="text-charcoal font-semibold">{selectedLog.actorName} (ADMIN)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Category:</span>
                  <span className="font-mono text-plum uppercase font-bold">{selectedLog.category}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-charcoal block mb-1">Operational Description:</span>
                <p className="text-charcoal/80 leading-relaxed bg-sand/10 p-2.5 rounded-lg border border-sand/40">
                  {selectedLog.details}
                </p>
              </div>

              {selectedLog.beforeAfter && (
                <div>
                  <span className="font-semibold text-charcoal block mb-1">Before & After Mutation Diff:</span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl overflow-x-auto">
                      <span className="text-rose-800 font-bold block mb-1 text-[10px] uppercase">Previous State</span>
                      <pre className="text-rose-950">{JSON.stringify(selectedLog.beforeAfter.before, null, 2)}</pre>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl overflow-x-auto">
                      <span className="text-emerald-800 font-bold block mb-1 text-[10px] uppercase">Committed State</span>
                      <pre className="text-emerald-950">{JSON.stringify(selectedLog.beforeAfter.after, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-sand/40">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-sand/30 hover:bg-sand/60 text-xs font-semibold text-charcoal rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
