import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit3,
  ExternalLink,
  Save,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { CMSHeroSection, CMSCategorySection } from '../../types';

const HERO_IMAGE_PRESETS = [
  '/assets/coverpages/coverpage-1.jpg',
  '/assets/coverpages/plain-modal-coverpage.png',
  '/assets/coverpages/dresses-coverpage.png',
  '/assets/coverpages/partywear-coverpage.png'
];

export const AdminCMSPage: React.FC = () => {
  const { cmsData, updateHero, updateSection, reorderSections, toggleSectionVisibility, resetCmsData } = useStore();
  const { logAction } = useAdmin();

  // Hero State
  const [heroForm, setHeroForm] = useState<CMSHeroSection>({ ...cmsData.hero });
  const [heroSaved, setHeroSaved] = useState(false);

  // Active editing section
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<CMSCategorySection | null>(null);

  const handleHeroSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHero(heroForm);
    logAction('cms', 'Updated Homepage Hero', `Updated hero headline to "${heroForm.title}" and CTA link to ${heroForm.ctaLink}`);
    setHeroSaved(true);
    setTimeout(() => setHeroSaved(false), 2500);
  };

  const handleEditSection = (sec: CMSCategorySection) => {
    setEditingSectionId(sec.id);
    setSectionForm({ ...sec });
  };

  const handleSectionSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm) return;

    updateSection(sectionForm.id, sectionForm);
    logAction('cms', 'Updated Category Section', `Modified copy & visual settings for section "${sectionForm.title}"`);
    setEditingSectionId(null);
    setSectionForm(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= cmsData.homepageSections.length) return;

    const updated = [...cmsData.homepageSections];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    reorderSections(updated);
    logAction('cms', 'Reordered Homepage Sections', `Moved "${temp.title}" ${direction}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Homepage & CMS Manager
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 10 • Control live campaign heroes, 10 editorial category sections, order and visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Reset all homepage content to brand defaults?')) {
                resetCmsData();
                setHeroForm(cmsData.hero);
                logAction('cms', 'Reset Homepage CMS', 'Restored default editorial layout');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-charcoal/70 hover:text-charcoal bg-sand/30 hover:bg-sand/60 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Brand Defaults</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-plum text-beige hover:bg-plum/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Live Storefront</span>
          </a>
        </div>
      </div>

      {/* ================= HERO CAMPAIGN MANAGER ================= */}
      <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-sand/40 bg-sand/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-plum text-beige flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal">Main Hero Campaign (CMS #1)</h3>
              <p className="text-[11px] text-charcoal/60">Full-bleed customer landing banner</p>
            </div>
          </div>
          {heroSaved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Published to Live Storefront</span>
            </span>
          )}
        </div>

        <form onSubmit={handleHeroSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Preview & Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-charcoal/80">
                Hero Desktop Background
              </label>
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-sand bg-plum shadow-sm">
                <img
                  src={heroForm.desktopImage}
                  alt="Hero campaign preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs text-beige font-serif">{heroForm.title}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-charcoal/60 block mb-1.5">Preset Campaign Assets:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {HERO_IMAGE_PRESETS.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setHeroForm({ ...heroForm, desktopImage: preset, mobileImage: preset })}
                      className={`relative aspect-[16/9] rounded-md overflow-hidden border-2 transition-all ${
                        heroForm.desktopImage === preset ? 'border-plum scale-95' : 'border-transparent hover:border-sand'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Custom Image Path
                </label>
                <input
                  type="text"
                  value={heroForm.desktopImage}
                  onChange={e => setHeroForm({ ...heroForm, desktopImage: e.target.value, mobileImage: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-sand/80 bg-sand/10 font-mono"
                />
              </div>
            </div>

            {/* Copy & CTA */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    Seasonal Badge Tag
                  </label>
                  <input
                    type="text"
                    value={heroForm.badge || ''}
                    onChange={e => setHeroForm({ ...heroForm, badge: e.target.value })}
                    placeholder="e.g. NEW COLLECTION 2026"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    Subtitle / Collection Tag
                  </label>
                  <input
                    type="text"
                    value={heroForm.subtitle}
                    onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                    placeholder="Campaign 2026"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Primary Headline Title
                </label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={e => setHeroForm({ ...heroForm, title: e.target.value })}
                  placeholder="The Art of Modesty"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white font-serif text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal/80 mb-1">
                  Editorial Paragraph Copy
                </label>
                <textarea
                  rows={2}
                  value={heroForm.description}
                  onChange={e => setHeroForm({ ...heroForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={heroForm.ctaText}
                    onChange={e => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/80 mb-1">
                    CTA Destination Link
                  </label>
                  <input
                    type="text"
                    value={heroForm.ctaLink}
                    onChange={e => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-sand/80 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-plum text-beige hover:bg-plum/90 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish Hero Changes</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ================= 10 EDITORIAL HOMEPAGE SECTIONS ================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-charcoal">
            Homepage Editorial Category Sections ({cmsData.homepageSections.length})
          </h2>
          <p className="text-xs text-charcoal/60">
            Reorder vertical presentation, toggle visibility, and update editorial banners and copy.
          </p>
        </div>

        <div className="space-y-3">
          {cmsData.homepageSections.map((sec, index) => {
            const isEditingThis = editingSectionId === sec.id;

            return (
              <div
                key={sec.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isEditingThis ? 'border-plum ring-2 ring-plum/20 shadow-md' : 'border-sand/60 shadow-xs'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Order buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveSection(index, 'up')}
                        className={`p-1 rounded hover:bg-sand/40 transition-colors ${
                          index === 0 ? 'text-charcoal/20 cursor-not-allowed' : 'text-charcoal/70'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === cmsData.homepageSections.length - 1}
                        onClick={() => moveSection(index, 'down')}
                        className={`p-1 rounded hover:bg-sand/40 transition-colors ${
                          index === cmsData.homepageSections.length - 1 ? 'text-charcoal/20 cursor-not-allowed' : 'text-charcoal/70'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-plum/60 w-6 shrink-0">
                      #{index + 1}
                    </span>

                    <img
                      src={sec.image}
                      alt={sec.title}
                      className="w-14 h-10 object-cover rounded-lg border border-sand shrink-0 shadow-xs"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-charcoal truncate">{sec.title}</h4>
                        <span className="text-[10px] text-charcoal/50 uppercase font-mono px-1.5 py-0.2 rounded bg-sand/30">
                          {sec.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/60 truncate max-w-md">{sec.statement}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(sec.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        sec.active
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-sand/40 text-charcoal/60 border border-sand'
                      }`}
                      title="Toggle section on/off on homepage"
                    >
                      {sec.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{sec.active ? 'Visible' : 'Hidden'}</span>
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => (isEditingThis ? setEditingSectionId(null) : handleEditSection(sec))}
                      className="p-1.5 text-charcoal/70 hover:text-plum hover:bg-sand/30 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingThis ? 'Close' : 'Edit'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Section Editor */}
                {isEditingThis && sectionForm && (
                  <form onSubmit={handleSectionSave} className="p-6 border-t border-sand/40 bg-sand/10 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-charcoal/80 mb-1">
                          Section Headline Title
                        </label>
                        <input
                          type="text"
                          value={sectionForm.title}
                          onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-charcoal/80 mb-1">
                          Editorial Badge
                        </label>
                        <input
                          type="text"
                          value={sectionForm.badge || ''}
                          onChange={e => setSectionForm({ ...sectionForm, badge: e.target.value })}
                          placeholder="e.g. EDITORIAL EXCLUSIVE"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-charcoal/80 mb-1">
                          Visual Layout Alignment
                        </label>
                        <select
                          value={sectionForm.align}
                          onChange={e => setSectionForm({ ...sectionForm, align: e.target.value as any })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                        >
                          <option value="left">Left Aligned</option>
                          <option value="right">Right Aligned</option>
                          <option value="center">Centered</option>
                          <option value="split">Split Grid</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-charcoal/80 mb-1">
                          Editorial Statement Description
                        </label>
                        <textarea
                          rows={2}
                          value={sectionForm.statement}
                          onChange={e => setSectionForm({ ...sectionForm, statement: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-charcoal/80 mb-1">
                          Banner Image URL
                        </label>
                        <input
                          type="text"
                          value={sectionForm.image}
                          onChange={e => setSectionForm({ ...sectionForm, image: e.target.value, mobileImage: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-charcoal/80 mb-1">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={sectionForm.ctaText}
                          onChange={e => setSectionForm({ ...sectionForm, ctaText: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-sand/80 bg-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-charcoal/80 mb-1">
                          Destination Link
                        </label>
                        <input
                          type="text"
                          value={sectionForm.destination}
                          onChange={e => setSectionForm({ ...sectionForm, destination: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-sand/80 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingSectionId(null)}
                        className="px-4 py-2 text-xs font-semibold text-charcoal/60 hover:bg-sand/30 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-beige bg-plum hover:bg-plum/90 rounded-lg shadow-sm"
                      >
                        Update Section
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
