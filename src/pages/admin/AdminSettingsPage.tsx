import React, { useState } from 'react';
import {
  Settings,
  Save,
  Tag,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Truck,
  Percent,
  Power
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { PromoCode, StoreSettings } from '../../types/admin';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useAdmin();
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode, resetAllData } = useStore();

  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Promo Modal state
  const [newPromoModal, setNewPromoModal] = useState(false);
  const [promoCodeName, setPromoCodeName] = useState('');
  const [promoType, setPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [promoValue, setPromoValue] = useState<number>(15);
  const [promoMinSpend, setPromoMinSpend] = useState<number>(50);
  const [promoDesc, setPromoDesc] = useState('');

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    showNotification('System and financial settings saved successfully.');
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeName.trim()) return;

    const newCode: PromoCode = {
      id: `p-${Date.now()}`,
      code: promoCodeName.trim().toUpperCase(),
      discountType: promoType,
      discountValue: promoValue,
      minSpend: promoMinSpend,
      active: true,
      usageCount: 0,
      description: promoDesc || (promoType === 'percentage' ? `${promoValue}% off` : `$${promoValue} off`)
    };

    addPromoCode(newCode);
    setNewPromoModal(false);
    setPromoCodeName('');
    showNotification(`Promo code "${newCode.code}" is now active.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Store Settings & Promotions Engine
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 3 & 7 • Global financial thresholds, taxes, promo codes and RBAC refund policies.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="bg-plum text-beige hover:bg-plum/90 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Store Profile & Support */}
        <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-plum flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Store Profile & Concierge Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">Store Name</label>
              <input
                type="text"
                value={form.storeName}
                onChange={e => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">Concierge Email</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={e => setForm({ ...form, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">Concierge Phone</label>
              <input
                type="text"
                value={form.supportPhone}
                onChange={e => setForm({ ...form, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Taxes, Currency & Shipping Policy */}
        <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-plum flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Commerce, Tax & Logistics Policy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">Sales Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.taxRatePercent}
                  onChange={e => setForm({ ...form, taxRatePercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white font-semibold"
                />
                <span className="absolute right-3.5 top-2 text-xs text-charcoal/40 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">
                Complimentary Shipping Minimum ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-xs text-charcoal/40 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  value={form.freeShippingThreshold}
                  onChange={e => setForm({ ...form, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">Standard Flat Shipping Fee ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-xs text-charcoal/40 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  value={form.standardShippingFee}
                  onChange={e => setForm({ ...form, standardShippingFee: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal/80 mb-1">Express Courier Rate ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-xs text-charcoal/40 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  value={form.expressShippingFee}
                  onChange={e => setForm({ ...form, expressShippingFee: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Section 3: Promotions Engine */}
      <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-plum flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>Promotions & Coupon Engine (Doc 02 Section 7)</span>
            </h3>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Active discount codes applied at customer bag and checkout.
            </p>
          </div>

          <button
            onClick={() => setNewPromoModal(true)}
            className="px-3.5 py-2 bg-plum text-beige hover:bg-plum/90 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Promo Code</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {promoCodes.map(promo => (
            <div
              key={promo.id}
              className={`p-4 rounded-xl border transition-all ${
                promo.active ? 'bg-sand/20 border-sand/60' : 'bg-sand/10 border-sand/30 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm tracking-wider text-plum bg-white px-2.5 py-1 rounded-md border border-sand">
                  {promo.code}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    promo.active ? 'bg-emerald-100 text-emerald-800' : 'bg-charcoal/10 text-charcoal/60'
                  }`}
                >
                  {promo.active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="text-xs font-semibold text-charcoal mb-1">
                {promo.discountType === 'percentage'
                  ? `${promo.discountValue}% Discount`
                  : `$${promo.discountValue} Flat Discount`}
              </div>
              <p className="text-[11px] text-charcoal/60 line-clamp-1 mb-3">{promo.description}</p>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-sand/40 text-charcoal/50">
                <span>Min spend: ${promo.minSpend || 0}</span>
                <span>Used: {promo.usageCount} times</span>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-sand/40">
                <button
                  type="button"
                  onClick={() => updatePromoCode(promo.id, { active: !promo.active })}
                  className="text-xs font-medium text-plum hover:underline"
                >
                  {promo.active ? 'Disable' : 'Enable'}
                </button>

                <button
                  type="button"
                  onClick={() => deletePromoCode(promo.id)}
                  className="p-1 text-charcoal/40 hover:text-rose-600 rounded transition-colors"
                  title="Remove promo code"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Maintenance & Factory Reset */}
      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Atelier Emergency / Mock Data Reset</span>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed max-w-2xl">
          Restore the entire product catalogue, homepage CMS sections, promo codes, and orders back to pristine Phase 1 & 2 mock defaults. All localStorage modifications will be re-initialized.
        </p>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all catalog, CMS, promo codes, and orders to brand defaults?')) {
              resetAllData();
              resetSettings();
              setForm({ ...settings });
              showNotification('Store data restored to pristine initial state.');
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Store Data to Clean Defaults</span>
        </button>
      </div>

      {/* Create Promo Modal */}
      {newPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-sand shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-charcoal">Create New Promo Code</h3>
            <form onSubmit={handleAddPromo} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. EID2026"
                  value={promoCodeName}
                  onChange={e => setPromoCodeName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold rounded-lg border border-sand/80"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">Discount Type</label>
                  <select
                    value={promoType}
                    onChange={e => setPromoType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">Value</label>
                  <input
                    type="number"
                    min="1"
                    value={promoValue}
                    onChange={e => setPromoValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">Minimum Order Spend ($)</label>
                <input
                  type="number"
                  min="0"
                  value={promoMinSpend}
                  onChange={e => setPromoMinSpend(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">Description / Customer Label</label>
                <input
                  type="text"
                  placeholder="e.g. 15% off Ramadan collection"
                  value={promoDesc}
                  onChange={e => setPromoDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPromoModal(false)}
                  className="px-4 py-2 text-xs text-charcoal/60 hover:bg-sand/30 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-plum text-beige rounded-lg text-xs font-semibold uppercase tracking-wider"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
