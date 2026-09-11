import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Save,
  HelpCircle,
  Tag,
  Sliders
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ColorPaletteResult } from '../../types';

interface QuizQuestionAdmin {
  id: string;
  step: number;
  question: string;
  options: {
    label: string;
    subtext: string;
    value: string;
    weight: 'Warm' | 'Cool' | 'Olive' | 'Neutral';
  }[];
}

const DEFAULT_QUIZ_QUESTIONS: QuizQuestionAdmin[] = [
  {
    id: 'q1',
    step: 1,
    question: 'How does your skin react to natural sun exposure?',
    options: [
      { label: 'Tans readily and turns golden bronze', subtext: 'Deepens with warm undertones', value: 'warm', weight: 'Warm' },
      { label: 'Burns quickly or turns pink/rosy', subtext: 'Cool or sensitive undertones', value: 'cool', weight: 'Cool' },
      { label: 'Burns first, then gradually tans to subtle olive', subtext: 'Balanced or greenish undertones', value: 'olive', weight: 'Olive' },
      { label: 'Neither burns nor tans easily', subtext: 'Harmonious balanced undertones', value: 'neutral', weight: 'Neutral' }
    ]
  },
  {
    id: 'q2',
    step: 2,
    question: 'Examine the veins on the inside of your wrist in natural daylight:',
    options: [
      { label: 'Olive or distinctly green veins', subtext: 'Signature of warm golden undertones', value: 'warm', weight: 'Warm' },
      { label: 'Blue or purplish violet veins', subtext: 'Signature of cool rosy undertones', value: 'cool', weight: 'Cool' },
      { label: 'A blend of blue, green and teal veins', subtext: 'Olive undertone indicator', value: 'olive', weight: 'Olive' },
      { label: 'Difficult to discern blue vs green', subtext: 'Neutral undertone indicator', value: 'neutral', weight: 'Neutral' }
    ]
  },
  {
    id: 'q3',
    step: 3,
    question: 'Which precious metal brings out the most radiance against your skin?',
    options: [
      { label: 'Rich yellow gold and antique brass', subtext: 'Complements warm honey complexions', value: 'warm', weight: 'Warm' },
      { label: 'Bright platinum, silver and white gold', subtext: 'Complements cool alabaster complexions', value: 'cool', weight: 'Cool' },
      { label: 'Antique bronze and brushed champagne gold', subtext: 'Complements olive complexions', value: 'olive', weight: 'Olive' },
      { label: 'Both silver and gold flatter equally', subtext: 'True neutral harmony', value: 'neutral', weight: 'Neutral' }
    ]
  }
];

const DEFAULT_PALETTES: ColorPaletteResult[] = [
  {
    undertone: 'Warm',
    paletteName: 'The Ochre & Terracotta Atelier',
    headline: 'Earthy warmth, desert sands, and sun-drenched golden tones.',
    description: 'Your complexion carries rich golden or peachy undertones that glow against spiced, grounding pigments.',
    paletteColors: [
      { name: 'Desert Sand', hex: '#D2B48C' },
      { name: 'Warm Terracotta', hex: '#C86D51' },
      { name: 'Spiced Ochre', hex: '#C68B59' },
      { name: 'Olive Grove', hex: '#556B2F' },
      { name: 'Golden Honey', hex: '#E1A95F' }
    ],
    jewelleryTone: 'Yellow Gold, Antique Brass & Polished Copper',
    jewelleryDescription: 'Warm 18k and 22k yellow golds illuminate the natural golden cast of your skin.',
    recommendedSubcategories: ['plain-modal', 'dresses', 'coord-sets'],
    colorFilterKeywords: ['warm', 'earthy']
  },
  {
    undertone: 'Cool',
    paletteName: 'The Sapphire & Rose Atelier',
    headline: 'Crisp jewel tones, iced pastels, and refined twilight plums.',
    description: 'Your skin carries blue or pink undertones that find balance in deep, saturated jewel hues.',
    paletteColors: [
      { name: 'Plum Noir', hex: '#34232C' },
      { name: 'Dusty Rose', hex: '#C9A9A6' },
      { name: 'Midnight Navy', hex: '#1C2541' },
      { name: 'Slate Teal', hex: '#3D5A80' },
      { name: 'Iced Lilac', hex: '#D8D4E2' }
    ],
    jewelleryTone: 'Cool Platinum, Bright Silver & White Gold',
    jewelleryDescription: 'Cool metals provide crisp, high-contrast framing that echoes the clarity of your complexion.',
    recommendedSubcategories: ['printed-modal', 'partywear', 'skirts'],
    colorFilterKeywords: ['cool', 'deep']
  },
  {
    undertone: 'Olive',
    paletteName: 'The Sage & Amber Atelier',
    headline: 'Subtle greenish undertones elevated by muted earth tones and rich amber.',
    description: 'Olive undertones thrive in nuanced, desaturated hues like sage, antique moss, and warm cream.',
    paletteColors: [
      { name: 'Muted Sage', hex: '#8F9E8B' },
      { name: 'Antique Bronze', hex: '#7E6B5A' },
      { name: 'Burnt Amber', hex: '#A85A32' },
      { name: 'Raw Linen', hex: '#E6DFD5' },
      { name: 'Deep Forest', hex: '#2C402E' }
    ],
    jewelleryTone: 'Brushed Champagne Gold & Antique Bronze',
    jewelleryDescription: 'Soft champagne gold warms the greenish cast without creating harsh visual contrast.',
    recommendedSubcategories: ['classical-jersey', 'tops', 'coord-sets'],
    colorFilterKeywords: ['olive', 'earthy']
  },
  {
    undertone: 'Neutral',
    paletteName: 'The Universal Harmony Atelier',
    headline: 'Balanced undertones with the freedom to explore all palettes.',
    description: 'Your undertones possess an equilibrium of warm and cool properties, allowing you to wear both spectrums with ease.',
    paletteColors: [
      { name: 'Oatmeal Melange', hex: '#D7C4B7' },
      { name: 'Rich Espresso', hex: '#3B2F2F' },
      { name: 'Vintage Mauve', hex: '#9B7874' },
      { name: 'Ivory Cream', hex: '#FDFBF7' },
      { name: 'Charcoal Noir', hex: '#2B2B2B' }
    ],
    jewelleryTone: 'Dual Metal Harmony: Mixed Silver and Yellow Gold',
    jewelleryDescription: 'You can effortlessly mix white and yellow metals without clashing.',
    recommendedSubcategories: ['classical-jersey', 'plain-modal', 'dresses'],
    colorFilterKeywords: ['neutral', 'soft']
  }
];

export const AdminColorTheoryPage: React.FC = () => {
  const { logAction } = useAdmin();

  const [activeVersion, setActiveVersion] = useState<'v1.2 (Active)' | 'v1.1 (Archived)'>('v1.2 (Active)');
  const [questions, setQuestions] = useState<QuizQuestionAdmin[]>(DEFAULT_QUIZ_QUESTIONS);
  const [palettes, setPalettes] = useState<ColorPaletteResult[]>(DEFAULT_PALETTES);
  const [activeTab, setActiveTab] = useState<'palettes' | 'questions'>('palettes');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    logAction('color-theory', 'Updated Color Theory Configuration', 'Modified palette guidance and quiz version weighting.');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Color Theory CMS & Quiz Engine
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 11 • Undertone algorithms, palette styling, and quiz question versioning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/find-your-colors"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-charcoal/70 bg-sand/30 hover:bg-sand/60 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Quiz UI</span>
          </a>

          <button
            onClick={handleSave}
            className="bg-plum text-beige hover:bg-plum/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Publish Version</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Color Theory configuration published. Historical quiz results remain immutable.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-sand/60 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('palettes')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'palettes'
                ? 'bg-plum text-beige shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            4 Core Palette Definitions
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'questions'
                ? 'bg-plum text-beige shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            Diagnostic Quiz Questions ({questions.length})
          </button>
        </div>

        <span className="text-xs font-mono font-bold text-plum/70 px-3">
          Active Version: <strong>v1.2</strong>
        </span>
      </div>

      {activeTab === 'palettes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {palettes.map((pal, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-sand/60 shadow-xs p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand/40">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      pal.undertone === 'Warm'
                        ? 'bg-amber-500'
                        : pal.undertone === 'Cool'
                        ? 'bg-sky-500'
                        : pal.undertone === 'Olive'
                        ? 'bg-emerald-600'
                        : 'bg-purple-500'
                    }`}
                  />
                  <h3 className="text-sm font-bold text-charcoal">{pal.undertone} Undertone</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-plum/80 bg-plum/10 px-2 py-0.5 rounded">
                  Palette #{idx + 1}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal/70 mb-1">
                  Palette Title
                </label>
                <input
                  type="text"
                  value={pal.paletteName}
                  onChange={e => {
                    const updated = [...palettes];
                    updated[idx].paletteName = e.target.value;
                    setPalettes(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-sand/80 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal/70 mb-1">
                  Atelier Headline
                </label>
                <input
                  type="text"
                  value={pal.headline}
                  onChange={e => {
                    const updated = [...palettes];
                    updated[idx].headline = e.target.value;
                    setPalettes(updated);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-sand/80 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal/70 mb-1.5">
                  Curated Swatches ({pal.paletteColors.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {pal.paletteColors.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center gap-1.5 pl-2 pr-2 py-1 rounded-full border border-sand bg-sand/10 text-[11px]"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-medium text-charcoal">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-sand/20 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-plum block">Jewellery Guidance:</span>
                <p className="text-[11px] text-charcoal/70 leading-relaxed">{pal.jewelleryTone}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Quiz Questions */
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-sand/60 shadow-xs p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sand/40">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-plum text-beige text-xs font-bold flex items-center justify-center">
                    {q.step}
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Question #{q.step}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-charcoal/50">ID: {q.id}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-charcoal/70 mb-1">
                  Question Prompt Text
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={e => {
                    const updated = [...questions];
                    updated[idx].question = e.target.value;
                    setQuestions(updated);
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-sand/80 bg-white font-medium"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-charcoal/70 mb-2">
                  Answer Choices & Undertone Allocation:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className="p-3 rounded-xl bg-sand/20 border border-sand/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-charcoal block">{opt.label}</span>
                        <span className="text-[11px] text-charcoal/50">{opt.subtext}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-plum/10 text-plum shrink-0">
                        {opt.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
