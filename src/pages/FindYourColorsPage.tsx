import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag } from 'lucide-react';
import { QUIZ_QUESTIONS, calculatePalette } from '../data/cmsData';
import { PRODUCTS } from '../data/products';
import { ColorPaletteResult } from '../types';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const FindYourColorsPage: React.FC = () => {
  const { quizResult, setQuizResult, addToCart } = useStore();

  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = welcome, 1..5 = questions, 6 = calculating, 7 = results
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentStep < QUIZ_QUESTIONS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate scores
      setIsAnalyzing(true);
      setCurrentStep(6);

      const scoreTotals = {
        warm: 0,
        cool: 0,
        olive: 0,
        soft: 0,
        deep: 0,
        bright: 0
      };

      QUIZ_QUESTIONS.forEach(q => {
        const selectedIdx = selectedAnswers[q.id];
        if (selectedIdx !== undefined) {
          const opt = q.options[selectedIdx];
          if (opt && opt.score) {
            Object.entries(opt.score).forEach(([key, val]) => {
              (scoreTotals as any)[key] = ((scoreTotals as any)[key] || 0) + val;
            });
          }
        }
      });

      setTimeout(() => {
        const result = calculatePalette(scoreTotals);
        setQuizResult(result);
        setIsAnalyzing(false);
        setCurrentStep(7);
      }, 1400);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setCurrentStep(1);
  };

  // If user already had a saved result and is on step 0, show result option
  const activeResult: ColorPaletteResult | null =
    currentStep === 7 ? quizResult : quizResult && currentStep === 0 ? quizResult : null;

  // Matching products based on palette keywords
  const matchedProducts = activeResult
    ? PRODUCTS.filter(p => {
        const matchesTag = p.paletteTags.some(t =>
          activeResult.colorFilterKeywords.includes(t.toLowerCase())
        );
        const matchesSubcat = activeResult.recommendedSubcategories.includes(p.subcategory);
        return matchesTag || matchesSubcat;
      }).slice(0, 6)
    : [];

  return (
    <div className="pt-20 min-h-screen bg-theme-bg text-theme-text">
      {/* Intro Header */}
      <section className="bg-theme-surface-secondary text-theme-text py-16 sm:py-24 relative overflow-hidden border-b border-theme-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-theme-accent/10 px-4 py-1.5 rounded-full border border-theme-border text-xs font-semibold uppercase tracking-editorial text-theme-text">
            <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
            <span>Needle Atelier Color Theory™</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-theme-text">
            Find Your Colors
          </h1>
          <p className="text-sm sm:text-base text-theme-muted font-light max-w-xl mx-auto leading-relaxed">
            Discover the precise hijab palettes and jewellery tones calibrated to elevate your natural undertone and personal story.
          </p>
        </div>
      </section>

      {/* Main Quiz Flow */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* STEP 0: Welcome screen */}
        {currentStep === 0 && !activeResult && (
          <div className="bg-theme-surface border border-theme-border p-8 sm:p-12 text-center shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-full bg-theme-surface-subtle mx-auto flex items-center justify-center text-theme-accent">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-theme-text">
              A 2-Minute Guided Color Analysis
            </h2>

            <p className="text-sm text-theme-muted font-light max-w-lg mx-auto leading-relaxed">
              Based on color temperature, natural contrast, and metal affinity. Our algorithmic assessment links your answers directly to curated modest textiles in our catalogue.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto py-4 text-xs font-light text-theme-muted">
              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <strong className="block font-semibold text-theme-text mb-1">1. Undertone</strong>
                <span>Determine Warm, Cool, or Olive complexions.</span>
              </div>
              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <strong className="block font-semibold text-theme-text mb-1">2. Metals</strong>
                <span>Curate yellow gold, platinum, or rose metals.</span>
              </div>
              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <strong className="block font-semibold text-theme-text mb-1">3. Fabrics</strong>
                <span>Shop matching jerseys, modals, and satins.</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-theme-accent text-theme-accent-contrast px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg inline-flex items-center gap-2"
              >
                <span>Begin Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* QUESTIONS 1..5 */}
        {currentStep >= 1 && currentStep <= 5 && (
          <div className="bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-sm">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3">
              <span>Question {currentStep} of {QUIZ_QUESTIONS.length}</span>
              <span>{Math.round((currentStep / QUIZ_QUESTIONS.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-theme-border h-1.5 rounded-full mb-8 overflow-hidden">
              <div
                className="bg-theme-accent h-full transition-all duration-300"
                style={{ width: `${(currentStep / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Details */}
            {(() => {
              const q = QUIZ_QUESTIONS[currentStep - 1];
              const selectedIdx = selectedAnswers[q.id];

              return (
                <div>
                  <h2 className="text-xl sm:text-2xl font-light tracking-tight text-theme-text mb-2">
                    {q.question}
                  </h2>
                  <p className="text-xs text-theme-muted font-light mb-8">{q.subtitle}</p>

                  {/* Options List */}
                  <div className="space-y-3 mb-8">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(q.id, idx)}
                        className={`w-full text-left p-4 sm:p-5 border transition-all flex items-start justify-between gap-4 ${
                          selectedIdx === idx
                            ? 'border-theme-accent bg-theme-accent text-theme-accent-contrast shadow-md'
                            : 'border-theme-border bg-theme-surface hover:border-theme-accent/50 text-theme-text'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold tracking-tight">{opt.label}</p>
                          <p
                            className={`text-xs mt-1 font-light ${
                              selectedIdx === idx ? 'text-theme-accent-contrast/80' : 'text-theme-muted'
                            }`}
                          >
                            {opt.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedIdx === idx
                              ? 'border-theme-accent-contrast bg-theme-accent-contrast text-theme-accent'
                              : 'border-theme-border'
                          }`}
                        >
                          {selectedIdx === idx && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-theme-border">
                    <button
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                      className="text-xs font-semibold uppercase tracking-wider text-theme-muted hover:text-theme-text disabled:opacity-30 transition-colors"
                    >
                      Back
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={selectedIdx === undefined}
                      className="bg-theme-accent text-theme-accent-contrast px-7 py-3 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2 shadow-sm"
                    >
                      <span>{currentStep === QUIZ_QUESTIONS.length ? 'Calculate Result' : 'Next Question'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* STEP 6: Analyzing State */}
        {currentStep === 6 && (
          <div className="bg-theme-surface border border-theme-border p-16 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 border-2 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-lg font-light tracking-tight text-theme-text pt-2">
              Analyzing Your Color Frequency...
            </h3>
            <p className="text-xs text-theme-muted font-light max-w-sm mx-auto">
              Calibrating skin temperature, contrast ratio, and metal harmony against the Needle textile database.
            </p>
          </div>
        )}

        {/* STEP 7: Personalized Result Screen */}
        {activeResult && (currentStep === 7 || currentStep === 0) && (
          <div className="space-y-12">
            {/* Result Header Card */}
            <div className="bg-theme-surface border border-theme-border p-8 sm:p-12 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-theme-border">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-editorial text-theme-muted block mb-1">
                    Your Needle Palette Profile
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-theme-text">
                    {activeResult.paletteName}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-theme-accent text-theme-accent-contrast px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    Undertone: {activeResult.undertone}
                  </span>
                  <button
                    onClick={handleRetake}
                    className="p-2 border border-theme-border hover:bg-theme-accent/10 text-theme-text transition-colors"
                    title="Retake Quiz"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-6 space-y-4">
                <p className="text-lg font-light text-theme-text italic">
                  &ldquo;{activeResult.headline}&rdquo;
                </p>
                <p className="text-sm text-theme-muted font-light leading-relaxed max-w-3xl">
                  {activeResult.description}
                </p>
              </div>

              {/* Color Swatches Grid */}
              <div className="pt-4 border-t border-theme-border">
                <h4 className="text-xs font-semibold uppercase tracking-editorial text-theme-muted mb-4">
                  Signature Shades to Explore
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {activeResult.paletteColors.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-theme-surface-subtle border border-theme-border">
                      <span
                        className="w-7 h-7 rounded-full border border-black/15 flex-shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-xs font-medium text-theme-text truncate">
                        {col.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jewellery Recommendations */}
              <div className="mt-8 p-5 bg-theme-surface-secondary text-theme-text border border-theme-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-editorial text-theme-text mb-1">
                    Complementary Jewellery Tone
                  </h4>
                  <p className="text-sm font-medium text-theme-text">
                    {activeResult.jewelleryTone}
                  </p>
                  <p className="text-xs text-theme-muted font-light mt-1 max-w-xl">
                    {activeResult.jewelleryDescription}
                  </p>
                </div>
                <Link
                  to="/accessories/hijab-magnets"
                  className="bg-theme-accent text-theme-accent-contrast px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
                >
                  Shop Hardware
                </Link>
              </div>
            </div>

            {/* Matching Products Section */}
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-theme-border">
                <div>
                  <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-1">
                    Curated For Your Palette
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-theme-text">
                    Creations in Your Shades
                  </h3>
                </div>
                <button
                  onClick={handleRetake}
                  className="text-xs font-semibold uppercase tracking-wider text-theme-text underline hover:text-theme-muted flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {matchedProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
