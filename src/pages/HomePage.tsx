import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const { cmsData, products } = useStore();
  const { hero, homepageSections } = cmsData;

  // Curated products for editorial teasers (filtering active/published)
  const activeProducts = products.filter(p => p.status !== 'archived');
  const dressPicks = activeProducts.filter(p => p.subcategory === 'dresses').slice(0, 3);
  const jerseyPicks = activeProducts.filter(p => p.subcategory === 'classical-jersey').slice(0, 3);
  const printedPicks = activeProducts.filter(p => p.subcategory === 'printed-modal').slice(0, 4);
  const plainPicks = activeProducts.filter(p => p.subcategory === 'plain-modal').slice(0, 3);
  const partywearPicks = activeProducts.filter(p => p.subcategory === 'partywear').slice(0, 3);
  const coordPicks = activeProducts.filter(p => p.subcategory === 'coord-sets').slice(0, 3);
  const topsPicks = activeProducts.filter(p => p.subcategory === 'tops').slice(0, 2);
  const accessoriesPicks = activeProducts.filter(p => p.category === 'accessories').slice(0, 3);

  return (
    <div className="w-full">
      {/* ==================== 1. HERO / COVER SECTION ==================== */}
      {/* Visual hierarchy: HEADER -> small visual breathing space -> COVER / HERO */}
      <section className="relative w-full pt-[72px] sm:pt-[76px] bg-theme-bg">
        <div className="relative w-full min-h-[82vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden bg-plum text-beige">
          {/* Full-bleed background image with subtle zoom */}
          <div className="absolute inset-0 z-0">
            <img
              src={hero.desktopImage}
              alt="Needle Editorial Campaign"
              className="w-full h-full object-cover object-center filter brightness-[0.85] scale-[1.01] transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/85 via-plum/30 to-transparent" />
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-16 sm:py-24 flex flex-col items-center">
            {hero.badge && (
              <span className="inline-block bg-beige text-plum text-[10px] sm:text-xs font-bold uppercase tracking-editorial px-4 py-1.5 mb-6 shadow-sm">
                {hero.badge}
              </span>
            )}

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-beige max-w-4xl leading-[1.08] mb-6">
              {hero.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-beige/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              {hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to={hero.ctaLink}
                className="w-full sm:w-auto bg-beige text-plum px-8 py-4 text-xs font-semibold uppercase tracking-editorial hover:bg-beige/90 transition-all flex items-center justify-center gap-3 shadow-lg group"
              >
                <span>{hero.ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/find-your-colors"
                className="w-full sm:w-auto bg-plum/40 backdrop-blur-md border border-beige/40 text-beige px-7 py-4 text-xs font-semibold uppercase tracking-editorial hover:bg-plum/70 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find Your Palette</span>
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 text-beige/60">
            <span className="text-[10px] uppercase tracking-editorial font-medium">Scroll to Discover</span>
            <div className="w-px h-8 bg-beige/30" />
          </div>
        </div>
      </section>


      {/* ==================== 2. DRESSES SECTION ==================== */}
      <section className="py-20 lg:py-28 bg-theme-bg text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Editorial Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-theme-border gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
                01 / Collection
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                The Dress Edit
              </h2>
            </div>
            <p className="text-sm text-theme-muted max-w-md font-light leading-relaxed">
              Floor-sweeping silhouettes sculpted in breathable silk-linen and delicate floral broderie. Designed for timeless ease.
            </p>
          </div>

          {/* Full-width editorial banner */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden mb-12 shadow-sm group">
            <img
              src="/assets/coverpages/dresses-coverpage.png"
              alt="The Dress Edit"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6 sm:p-12">
              <div className="text-white max-w-md">
                <span className="text-[10px] tracking-editorial uppercase bg-white text-black px-3 py-1 font-bold inline-block mb-3">
                  Spring / Summer Capsule
                </span>
                <p className="text-lg sm:text-2xl font-light mb-4 text-white">
                  Elysian Polka Jacquard & Linen Maxi Dresses
                </p>
                <Link
                  to="/clothing/dresses"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-white border-b border-white pb-1 hover:text-white/80"
                >
                  <span>Explore All Dresses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dressPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ==================== 3. CLASSICAL JERSEY HIJAB ==================== */}
      <section className="py-20 lg:py-28 bg-theme-surface border-y border-theme-border text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block">
                02 / Foundation
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Classical Jersey Hijabs
              </h2>
              <p className="text-sm text-theme-muted font-light leading-relaxed">
                The cornerstone of the Needle wardrobe. Our 220 GSM modal-spandex weave offers a buttery, breathable non-slip drape with generous length. Requires zero pins and stays in place from dawn to dusk.
              </p>
              <div className="pt-2">
                <Link
                  to="/hijab/classical-jersey"
                  className="inline-flex items-center gap-3 bg-theme-accent text-theme-accent-contrast px-7 py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  <span>Shop Jersey Hijabs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden group shadow-sm border border-theme-border">
                <img
                  src="/assets/classical-jersey/product-1.jpg"
                  alt="Classical Jersey Hijab"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 right-4 bg-theme-surface/95 border border-theme-border px-4 py-2 text-xs font-semibold tracking-wider text-theme-text backdrop-blur-sm">
                  220 GSM Ultra-Soft Stretch Rayon
                </div>
              </div>
            </div>
          </div>

          {/* Jersey Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            {jerseyPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ==================== 4. PRINTED MODAL ==================== */}
      <section className="py-20 lg:py-28 bg-theme-bg text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-theme-border gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
                03 / Artistry
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Artisanal Printed Modal
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <p className="text-sm text-theme-muted max-w-md font-light leading-relaxed mb-4 md:text-right">
                Intricate Mediterranean tilework, greenhouse botanicals, and hand-painted mineral brushstrokes rendered on featherlight sustainable modal.
              </p>
              <Link
                to="/hijab/printed-modal"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-theme-text hover:text-theme-muted"
              >
                <span>Explore All 13 Prints</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 4-col Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {printedPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ==================== 5. PLAIN MODAL ==================== */}
      <section className="py-20 lg:py-28 bg-theme-surface border-y border-theme-border text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="relative aspect-[16/10] overflow-hidden group shadow-lg border border-theme-border">
                <img
                  src="/assets/coverpages/plain-modal-coverpage.png"
                  alt="Pure Plain Modal"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block">
                04 / Essential Elegance
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Pure Plain Modal
              </h2>
              <p className="text-sm text-theme-muted font-light leading-relaxed">
                As breathable as silk with a whisper-soft matte texture. Harvested from sustainable Austrian beechwood, our modal hijabs drape with poetic fluidity and natural temperature-regulating comfort.
              </p>
              <div className="pt-2">
                <Link
                  to="/hijab/plain-modal"
                  className="inline-flex items-center gap-3 bg-theme-accent text-theme-accent-contrast px-7 py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  <span>Shop Plain Modal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            {plainPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ==================== 6. PARTYWEAR HIJABS ==================== */}
      <section className="py-20 lg:py-28 bg-theme-bg text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-theme-border gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
                05 / Occasion
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Lustrous Partywear Hijabs
              </h2>
            </div>
            <p className="text-sm text-theme-muted max-w-md font-light leading-relaxed">
              Designed for life&apos;s grandest celebrations. Permanent micro-pleated satin with an incandescent liquid sheen that frames the face with regal radiance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {partywearPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/hijab/partywear"
              className="inline-flex items-center gap-3 bg-theme-accent text-theme-accent-contrast px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              <span>Explore Partywear Hijabs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ==================== 7. CO-ORD SETS ==================== */}
      <section className="py-20 lg:py-28 bg-theme-surface border-t border-theme-border text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block">
                06 / Coordinated Harmony
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Signature Co-ord Sets
              </h2>
              <p className="text-sm text-theme-muted font-light leading-relaxed">
                Streamline your dressing ritual with perfectly proportioned modest matching sets. Tunics cut with sweeping hemlines paired with fluid palazzo trousers and pleated skirts.
              </p>
              <div className="pt-2">
                <Link
                  to="/clothing/coord-sets"
                  className="inline-flex items-center gap-3 bg-theme-accent text-theme-accent-contrast px-7 py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  <span>Shop Co-ord Sets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden group shadow-sm border border-theme-border">
                <img
                  src="/assets/coord-sets/product-6.jpeg"
                  alt="Co-ord Sets"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {coordPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ==================== 8. TOPS ==================== */}
      <section className="py-20 lg:py-28 bg-theme-bg text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-theme-border gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
                07 / Foundations
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Everyday Modest Tops
              </h2>
            </div>
            <p className="text-sm text-theme-muted max-w-md font-light leading-relaxed">
              Thoughtfully engineered with modest jewel necklines, lengthened bodices, and balloon button cuffs for seamless everyday layering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {topsPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/clothing/tops"
              className="inline-flex items-center gap-3 border border-theme-border px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-theme-text hover:bg-theme-accent hover:text-theme-accent-contrast transition-colors"
            >
              <span>View All Tops</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ==================== 9. SKIRTS ==================== */}
      <section className="py-20 lg:py-28 bg-theme-surface border-y border-theme-border text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block">
                08 / Silhouette
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Flowing Maxi Skirts
              </h2>
              <p className="text-sm text-theme-muted font-light leading-relaxed">
                Sculptural movement meets modest grace. Our upcoming sunray pleats and heavy bias-cut satins are designed to move like liquid fabric with every stride.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/clothing/skirts"
                  className="inline-flex items-center gap-3 bg-theme-accent text-theme-accent-contrast px-7 py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  <span>Explore Skirts Capsule</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-[11px] uppercase tracking-widest bg-theme-surface-subtle px-3 py-2 border border-theme-border text-theme-text">
                  Autumn Preview
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden shadow-xl border border-theme-border">
                <img
                  src="/assets/coverpages/dresses-coverpage.png"
                  alt="Flowing Maxi Skirts"
                  className="w-full h-full object-cover object-center filter brightness-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center">
                  <div className="bg-theme-surface/90 backdrop-blur-sm p-6 border border-theme-border max-w-xs text-theme-text">
                    <span className="text-[10px] tracking-editorial uppercase text-theme-muted block mb-1">
                      New Season Preview
                    </span>
                    <p className="text-sm font-light text-theme-text">
                      Sunray Pleated Satins & Linen Midis launching soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ==================== 10. ACCESSORIES ==================== */}
      <section className="py-20 lg:py-28 bg-theme-bg text-theme-text transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-theme-border gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
                09 / Precision Hardware
              </span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text">
                Curated Accessories
              </h2>
            </div>
            <p className="text-sm text-theme-muted max-w-md font-light leading-relaxed">
              Elevate your daily wrap with no-snag rare earth magnets, handcrafted jewelled styling wheels, and silk-lined protective undercaps.
            </p>
          </div>

          {/* Three-part composition: Magnets / Pins / Undercapes - All point to unified /accessories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Link
              to="/accessories"
              className="group relative aspect-[3/4] overflow-hidden bg-theme-surface flex flex-col justify-end p-6 border border-theme-border"
            >
              <img
                src="/assets/hijab-magnets/product-1.jpg"
                alt="No-Snag Hijab Magnets"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 text-white">
                <span className="text-[10px] uppercase tracking-editorial font-bold bg-white text-black px-2.5 py-1 inline-block mb-2">
                  No-Snag Technology
                </span>
                <h3 className="text-lg font-medium text-white">Hijab Magnets</h3>
                <p className="text-xs text-white/80 font-light mt-1">Ultra-strong N52 neodymium holds</p>
              </div>
            </Link>

            <Link
              to="/accessories"
              className="group relative aspect-[3/4] overflow-hidden bg-theme-surface flex flex-col justify-end p-6 border border-theme-border"
            >
              <img
                src="/assets/hijab-pins/product-1.jpg"
                alt="Crystal Styling Pins"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 text-white">
                <span className="text-[10px] uppercase tracking-editorial font-bold bg-white text-black px-2.5 py-1 inline-block mb-2">
                  Jewelled Styling
                </span>
                <h3 className="text-lg font-medium text-white">Crystal Styling Pins</h3>
                <p className="text-xs text-white/80 font-light mt-1">Ultra-fine surgical stainless steel</p>
              </div>
            </Link>

            <Link
              to="/accessories"
              className="group relative aspect-[3/4] overflow-hidden bg-theme-surface flex flex-col justify-end p-6 border border-theme-border"
            >
              <img
                src="/assets/classical-jersey/product-1.jpg"
                alt="Silk-Lined Undercaps"
                className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 text-white">
                <span className="text-[10px] uppercase tracking-editorial font-bold bg-white text-black px-2.5 py-1 inline-block mb-2">
                  Haircare Capsule
                </span>
                <h3 className="text-lg font-medium text-white">Silk-Lined Undercaps</h3>
                <p className="text-xs text-white/80 font-light mt-1">Anti-frizz mulberry silk interior</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {accessoriesPicks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>


      {/* ==================== 11. FIND YOUR COLORS (COLOR THEORY) ==================== */}
      <section className="py-24 bg-theme-surface border-t border-theme-border text-theme-text relative overflow-hidden transition-colors">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src="/assets/coverpages/plain-modal-coverpage.png"
            alt="Color Theory Experience"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-theme-surface-subtle px-4 py-1.5 rounded-full border border-theme-border text-xs font-semibold uppercase tracking-editorial text-theme-text">
            <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
            <span>Needle Color Theory™ Experience</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-theme-text">
            Find Your Signature Palette
          </h2>

          <p className="text-sm sm:text-base text-theme-muted font-light max-w-2xl mx-auto leading-relaxed">
            Discover the exact hijab and clothing hues calibrated to harmonize with your skin undertone, natural contrast, and complementary jewellery tones.
          </p>

          {/* Color palette preview pills */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full border border-theme-border bg-[#6C5449]" title="Mocha" />
            <div className="w-8 h-8 rounded-full border border-theme-border bg-[#A85741]" title="Terracotta" />
            <div className="w-8 h-8 rounded-full border border-theme-border bg-[#5A6349]" title="Olive" />
            <div className="w-8 h-8 rounded-full border border-theme-border bg-[#34232C]" title="Plum" />
            <div className="w-8 h-8 rounded-full border border-theme-border bg-[#EDE8DE]" title="Cream" />
          </div>

          <div className="pt-6">
            <Link
              to="/find-your-colors"
              className="inline-flex items-center gap-3 bg-theme-accent text-theme-accent-contrast px-9 py-4 text-xs font-semibold uppercase tracking-editorial hover:opacity-90 transition-opacity shadow-xl group"
            >
              <span>Take the 2-Minute Color Quiz</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
