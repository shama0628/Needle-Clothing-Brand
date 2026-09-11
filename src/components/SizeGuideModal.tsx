import React, { useState, useEffect } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SizeGuideModal: React.FC = () => {
  const { sizeGuideOpen, setSizeGuideOpen } = useStore();
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeTab, setActiveTab] = useState<'dresses' | 'coords' | 'hijabs' | 'tops'>('dresses');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sizeGuideOpen) {
        setSizeGuideOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sizeGuideOpen, setSizeGuideOpen]);

  if (!sizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setSizeGuideOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-theme-surface text-theme-text shadow-2xl z-10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-theme-border">
        <div className="flex items-center justify-between pb-4 border-b border-theme-border">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-theme-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-editorial">
              Needle Atelier Size & Fit Guide
            </h2>
          </div>
          <button
            onClick={() => setSizeGuideOpen(false)}
            className="p-1.5 rounded-full hover:bg-theme-accent/10 text-theme-muted hover:text-theme-text transition-colors"
            aria-label="Close size guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Units Selector & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
          <div className="flex border-b border-theme-border w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('dresses')}
              className={`pb-2 px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'dresses'
                  ? 'border-theme-accent text-theme-text'
                  : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              Dresses
            </button>
            <button
              onClick={() => setActiveTab('coords')}
              className={`pb-2 px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'coords'
                  ? 'border-theme-accent text-theme-text'
                  : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              Co-ord Sets
            </button>
            <button
              onClick={() => setActiveTab('tops')}
              className={`pb-2 px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'tops'
                  ? 'border-theme-accent text-theme-text'
                  : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              Tops
            </button>
            <button
              onClick={() => setActiveTab('hijabs')}
              className={`pb-2 px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'hijabs'
                  ? 'border-theme-accent text-theme-text'
                  : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              Hijabs & Shawls
            </button>
          </div>

          <div className="inline-flex bg-theme-surface-subtle p-1 border border-theme-border self-end sm:self-auto">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                unit === 'inches'
                  ? 'bg-theme-accent text-theme-accent-contrast font-semibold shadow-sm'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                unit === 'cm'
                  ? 'bg-theme-accent text-theme-accent-contrast font-semibold shadow-sm'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Measurement Tables */}
        <div className="mt-6 overflow-x-auto">
          {activeTab === 'dresses' && (
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-theme-border text-theme-text font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">US / UK</th>
                  <th className="py-2.5 px-3">Bust ({unit})</th>
                  <th className="py-2.5 px-3">Waist ({unit})</th>
                  <th className="py-2.5 px-3">Hips ({unit})</th>
                  <th className="py-2.5 px-3">Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border text-theme-muted">
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">XS</td>
                  <td className="py-3 px-3">US 2 / UK 6</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '33 - 34"' : '84 - 87 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '26 - 27"' : '66 - 69 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '36 - 37"' : '91 - 94 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '56"' : '142 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">S</td>
                  <td className="py-3 px-3">US 4-6 / UK 8-10</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '35 - 36"' : '89 - 92 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '28 - 29"' : '71 - 74 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '38 - 39"' : '96 - 99 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '57"' : '145 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">M</td>
                  <td className="py-3 px-3">US 8-10 / UK 12-14</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '37 - 39"' : '94 - 99 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '30 - 32"' : '76 - 81 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '40 - 42"' : '101 - 106 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '58"' : '147 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">L</td>
                  <td className="py-3 px-3">US 12-14 / UK 16</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '40 - 42"' : '101 - 107 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '33 - 35"' : '84 - 89 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '43 - 45"' : '109 - 114 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '58"' : '147 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">XL</td>
                  <td className="py-3 px-3">US 16 / UK 18</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '43 - 45"' : '109 - 114 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '36 - 38"' : '91 - 97 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '46 - 48"' : '117 - 122 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '58.5"' : '149 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'coords' && (
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-theme-border text-theme-text font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Tunic Bust</th>
                  <th className="py-2.5 px-3">Tunic Length</th>
                  <th className="py-2.5 px-3">Pants Waist</th>
                  <th className="py-2.5 px-3">Pants Inseam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border text-theme-muted">
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">XS</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '36"' : '91 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '40"' : '101 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '25 - 28"' : '63 - 71 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '30"' : '76 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">S</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '38"' : '96 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '41"' : '104 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '27 - 30"' : '68 - 76 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '30.5"' : '77 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">M</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '41"' : '104 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '42"' : '106 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '30 - 33"' : '76 - 84 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '31"' : '79 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">L</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '44"' : '112 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '43"' : '109 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '33 - 36"' : '84 - 91 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '31"' : '79 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'tops' && (
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-theme-border text-theme-text font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Bust</th>
                  <th className="py-2.5 px-3">Sleeve Length</th>
                  <th className="py-2.5 px-3">Total Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border text-theme-muted">
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">XS</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '36"' : '91 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '23.5"' : '60 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '30"' : '76 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">S</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '38"' : '96 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '24"' : '61 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '30.5"' : '77 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">M</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '40"' : '101 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '24.5"' : '62 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '31"' : '79 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-theme-text">L</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '43"' : '109 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '25"' : '63 cm'}</td>
                  <td className="py-3 px-3">{unit === 'inches' ? '32"' : '81 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'hijabs' && (
            <div className="space-y-4 text-xs font-light">
              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <h4 className="font-semibold text-theme-text text-sm mb-1">Classical Jersey Hijabs</h4>
                <p className="text-theme-muted">
                  {unit === 'inches' ? '73" length × 29.5" width' : '185 cm length × 75 cm width'}
                </p>
                <p className="text-theme-muted mt-1">
                  Generous maxi proportion allowing 2-3 folds without excessive bulk. High stretch memory.
                </p>
              </div>

              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <h4 className="font-semibold text-theme-text text-sm mb-1">Plain & Printed Modal</h4>
                <p className="text-theme-muted">
                  {unit === 'inches' ? '79" length × 33.5" width' : '200 cm length × 85 cm width'}
                </p>
                <p className="text-theme-muted mt-1">
                  Featherweight drape with full chest and shoulder coverage. Beautifully wide for airy, elegant layering.
                </p>
              </div>

              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <h4 className="font-semibold text-theme-text text-sm mb-1">Partywear Pleated Satins</h4>
                <p className="text-theme-muted">
                  {unit === 'inches' ? '75" length × 29.5" width' : '190 cm length × 75 cm width'}
                </p>
                <p className="text-theme-muted mt-1">
                  Micro-pleated architectural hold that frames evening crowns with fluid height and volume.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Measuring Advice */}
        <div className="mt-8 p-4 bg-theme-surface-subtle border-l-2 border-theme-accent">
          <div className="flex items-center gap-2 mb-2 text-theme-text font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-theme-accent" />
            <span>Needle Fit Guidance</span>
          </div>
          <p className="text-xs text-theme-muted font-light leading-relaxed">
            All Needle garments are engineered with modesty in mind: generous ease across the bust, lengthened bodices, and full opaque linings. If you prefer a tailored silhouette, we suggest ordering your true size; for an oversized editorial look, size up one size.
          </p>
        </div>
      </div>
    </div>
  );
};
