import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, Check } from 'lucide-react';
import { INITIAL_CMS_DATA } from '../data/cmsData';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="text-center py-12 border-b border-theme-border">
          <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
            The Atelier
          </span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-theme-text mb-4">
            Our Story
          </h1>
          <p className="text-base text-theme-muted font-light italic max-w-xl mx-auto">
            &ldquo;{INITIAL_CMS_DATA.brand.tagline}&rdquo;
          </p>
        </div>

        {/* Hero Image */}
        <div className="my-12 aspect-[16/9] overflow-hidden bg-theme-surface-subtle border border-theme-border">
          <img
            src="/assets/coverpages/coverpage-1.jpg"
            alt="Needle Atelier"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Story Content */}
        <div className="max-w-none text-sm sm:text-base font-light leading-relaxed space-y-8 text-theme-muted">
          <p className="text-lg leading-relaxed text-theme-text font-normal">
            NEEDLE was born from a singular conviction: modest dressing is an art form—a deliberate harmony between reverence, elegance, and architectural contemporary fashion.
          </p>

          <p>
            In a fast-paced digital era crowded with fleeting trends and opaque compromises, we set out to craft an atelier that honors the modest woman’s everyday journey. From our iconic 220 GSM classical jersey to our featherlight Austrian beechwood modal, each piece is measured by the drape of its fold and the breathability of its fibers.
          </p>

          <div className="p-8 bg-theme-accent text-theme-accent-contrast my-8 text-center space-y-3 shadow-md">
            <h3 className="text-xl font-light tracking-tight">The Needle Philosophy</h3>
            <p className="text-xs text-theme-accent-contrast/80 font-light max-w-lg mx-auto leading-relaxed">
              We design with intention: generous sweeps that ensure complete opacity, lengthened sleeves that frame gestures with poise, and precision magnetic hardware that treats delicate textiles with archival care.
            </p>
          </div>

          <h3 className="text-2xl font-light text-theme-text tracking-tight pt-4">Sustainable Craftsmanship</h3>
          <p>
            We partner exclusively with certified ethical mills that respect the earth. Our modal is sourced from sustainably managed beechwood groves, using low-impact water-based pigment dyes. Our packaging is 100% recyclable, FSC-certified, and designed to serve as an archival keeper for your wardrobe.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order & Sizing Inquiry');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 border-b border-theme-border mb-12">
          <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
            Client Care
          </span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text mb-3">
            Contact Concierge
          </h1>
          <p className="text-sm text-theme-muted font-light max-w-md mx-auto">
            Our atelier stylists and client support specialists are at your disposal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Direct Contact Info */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-editorial text-theme-text">
                Direct Channels
              </h3>

              <div className="flex items-start gap-3 text-xs text-theme-muted font-light">
                <Mail className="w-4 h-4 text-theme-accent mt-0.5" />
                <div>
                  <strong className="block text-theme-text font-semibold">Email Concierge</strong>
                  <span>{INITIAL_CMS_DATA.brand.supportEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-theme-muted font-light">
                <Phone className="w-4 h-4 text-theme-accent mt-0.5" />
                <div>
                  <strong className="block text-theme-text font-semibold">Concierge Line</strong>
                  <span>{INITIAL_CMS_DATA.brand.supportPhone}</span>
                  <p className="text-[11px] text-theme-muted/70">Mon–Fri: 9am – 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-theme-muted font-light">
                <MapPin className="w-4 h-4 text-theme-accent mt-0.5" />
                <div>
                  <strong className="block text-theme-text font-semibold">Atelier Showroom</strong>
                  <span>{INITIAL_CMS_DATA.brand.address}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-theme-surface-subtle border border-theme-border space-y-2 text-xs">
              <strong className="block font-semibold text-theme-text">Bespoke Bridal & Styling Consultations</strong>
              <p className="text-theme-muted font-light">
                Planning an occasion? Inquire for virtual 1-on-1 color and veil pairing sessions with our resident stylists.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-light text-theme-text">Inquiry Received</h3>
                <p className="text-xs text-theme-muted font-light max-w-xs mx-auto">
                  Thank you, {name}. A dedicated Needle concierge representative will reply within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-theme-muted mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-theme-muted mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-theme-muted mb-1">Topic</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  >
                    <option value="Order & Sizing Inquiry">Order & Sizing Inquiry</option>
                    <option value="Color Theory Guidance">Color Theory Guidance</option>
                    <option value="Returns & Exchanges">Returns & Exchanges</option>
                    <option value="Bespoke Styling Session">Bespoke Styling Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-theme-muted mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How may our concierge assist your story?"
                    className="w-full bg-theme-surface border border-theme-border px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-theme-accent text-theme-accent-contrast py-3.5 text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SizeGuidePage: React.FC = () => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeTab, setActiveTab] = useState<'dresses' | 'coords' | 'hijabs' | 'tops'>('dresses');

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 border-b border-theme-border mb-8">
          <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
            Proportions & Measurements
          </span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text mb-3">
            Atelier Size & Fit Guide
          </h1>
          <p className="text-sm text-theme-muted font-light max-w-md mx-auto">
            Engineered for modest ease, generous coverage, and tailored elegance.
          </p>
        </div>

        {/* Toggle & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex border-b border-theme-border w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('dresses')}
              className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'dresses'
                  ? 'border-theme-accent text-theme-text font-bold'
                  : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              Dresses
            </button>
            <button
              onClick={() => setActiveTab('coords')}
              className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'coords'
                  ? 'border-theme-accent text-theme-text font-bold'
                  : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              Co-ord Sets
            </button>
            <button
              onClick={() => setActiveTab('tops')}
              className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'tops'
                  ? 'border-theme-accent text-theme-text font-bold'
                  : 'border-transparent text-theme-muted hover:text-theme-text'
              }`}
            >
              Tops
            </button>
            <button
              onClick={() => setActiveTab('hijabs')}
              className={`pb-2.5 px-4 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 ${
                activeTab === 'hijabs'
                  ? 'border-theme-accent text-theme-text font-bold'
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

        {/* Tables */}
        <div className="bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-sm overflow-x-auto">
          {activeTab === 'dresses' && (
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-theme-border text-theme-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">US / UK Standard</th>
                  <th className="py-3 px-4">Bust ({unit})</th>
                  <th className="py-3 px-4">Waist ({unit})</th>
                  <th className="py-3 px-4">Hips ({unit})</th>
                  <th className="py-3 px-4">Modest Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border text-theme-muted">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">XS</td>
                  <td className="py-3.5 px-4">US 2 / UK 6</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '33 - 34"' : '84 - 87 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '26 - 27"' : '66 - 69 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '36 - 37"' : '91 - 94 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '56"' : '142 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">S</td>
                  <td className="py-3.5 px-4">US 4-6 / UK 8-10</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '35 - 36"' : '89 - 92 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '28 - 29"' : '71 - 74 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '38 - 39"' : '96 - 99 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '57"' : '145 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">M</td>
                  <td className="py-3.5 px-4">US 8-10 / UK 12-14</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '37 - 39"' : '94 - 99 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '30 - 32"' : '76 - 81 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '40 - 42"' : '101 - 106 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '58"' : '147 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">L</td>
                  <td className="py-3.5 px-4">US 12-14 / UK 16</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '40 - 42"' : '101 - 107 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '33 - 35"' : '84 - 89 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '43 - 45"' : '109 - 114 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '58"' : '147 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">XL</td>
                  <td className="py-3.5 px-4">US 16 / UK 18</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '43 - 45"' : '109 - 114 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '36 - 38"' : '91 - 97 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '46 - 48"' : '117 - 122 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '58.5"' : '149 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'coords' && (
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-theme-border text-theme-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Tunic Bust</th>
                  <th className="py-3 px-4">Tunic Length</th>
                  <th className="py-3 px-4">Pants Waist</th>
                  <th className="py-3 px-4">Pants Inseam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border text-theme-muted">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">XS</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '36"' : '91 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '40"' : '101 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '25 - 28"' : '63 - 71 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '30"' : '76 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">S</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '38"' : '96 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '41"' : '104 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '27 - 30"' : '68 - 76 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '30.5"' : '77 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">M</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '41"' : '104 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '42"' : '106 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '30 - 33"' : '76 - 84 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '31"' : '79 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">L</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '44"' : '112 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '43"' : '109 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '33 - 36"' : '84 - 91 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '31"' : '79 cm'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'tops' && (
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-theme-border text-theme-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Bust</th>
                  <th className="py-3 px-4">Sleeve Length</th>
                  <th className="py-3 px-4">Total Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border text-theme-muted">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">XS</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '36"' : '91 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '23.5"' : '60 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '30"' : '76 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">S</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '38"' : '96 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '24"' : '61 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '30.5"' : '77 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">M</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '40"' : '101 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '24.5"' : '62 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '31"' : '79 cm'}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-theme-text">L</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '43"' : '109 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '25"' : '63 cm'}</td>
                  <td className="py-3.5 px-4">{unit === 'inches' ? '32"' : '81 cm'}</td>
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
                <p className="text-theme-muted/80 mt-1">
                  Generous maxi proportion allowing 2-3 folds without excessive bulk. High stretch memory.
                </p>
              </div>

              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <h4 className="font-semibold text-theme-text text-sm mb-1">Plain & Printed Modal</h4>
                <p className="text-theme-muted">
                  {unit === 'inches' ? '79" length × 33.5" width' : '200 cm length × 85 cm width'}
                </p>
                <p className="text-theme-muted/80 mt-1">
                  Featherweight drape with full chest and shoulder coverage. Beautifully wide for airy, elegant layering.
                </p>
              </div>

              <div className="p-4 bg-theme-surface-subtle border border-theme-border">
                <h4 className="font-semibold text-theme-text text-sm mb-1">Partywear Pleated Satins</h4>
                <p className="text-theme-muted">
                  {unit === 'inches' ? '75" length × 29.5" width' : '190 cm length × 75 cm width'}
                </p>
                <p className="text-theme-muted/80 mt-1">
                  Micro-pleated architectural hold that frames evening crowns with fluid height and volume.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ShippingReturnsPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 border-b border-theme-border mb-12">
          <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
            Policies & Dispatch
          </span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text mb-3">
            Shipping & Returns
          </h1>
          <p className="text-sm text-theme-muted font-light max-w-md mx-auto">
            Transparent global delivery and seamless 14-day returns.
          </p>
        </div>

        <div className="space-y-12 text-sm font-light text-theme-muted leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-theme-text">
              1. Delivery Options & Rates
            </h2>
            <div className="border border-theme-border overflow-hidden bg-theme-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-theme-surface-subtle text-theme-text font-semibold border-b border-theme-border">
                  <tr>
                    <th className="p-3">Method</th>
                    <th className="p-3">Timeline</th>
                    <th className="p-3">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  <tr>
                    <td className="p-3 font-medium text-theme-text">Complimentary Express</td>
                    <td className="p-3">4 - 6 Business Days</td>
                    <td className="p-3">Free on orders over ₹2,500 (or ₹150)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-theme-text">Priority Courier</td>
                    <td className="p-3">1 - 2 Business Days</td>
                    <td className="p-3">₹250 flat rate</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-theme-text">International Concierge</td>
                    <td className="p-3">5 - 8 Business Days</td>
                    <td className="p-3">₹1,200 flat rate (DDP duties prepaid)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-theme-text">
              2. 14-Day Return & Exchange Policy
            </h2>
            <p>
              We want every Needle creation to feel like a treasured chapter in your wardrobe. If an item does not suit your proportions, you may initiate a return within 14 days of delivery.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-theme-muted">
              <li>Items must be in unworn, unwashed condition with all original atelier tags attached.</li>
              <li>Hijabs must be folded in original packaging without pin punctures or perfume scent.</li>
              <li>Accessories and magnets must be returned in their protective presentation case.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-theme-text">
              3. Archival Protective Packaging
            </h2>
            <p>
              Every order is hand-inspected, enveloped in acid-free tissue paper, and sealed with our signature wax stamp before dispatch.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do your classical jersey hijabs require pins or magnets?',
      a: 'Our Classical Jersey is crafted from a high-density 220 GSM modal-rayon with 5% spandex memory. It naturally grips without pulling or slipping, allowing you to style it completely pin-free for casual daily wear, or secured with our no-snag magnets for structured styling.'
    },
    {
      q: 'Are your maxi dresses and tunics fully opaque?',
      a: 'Yes. Modesty is the fundamental premise of Needle. All our light-colored dresses, tunics, and co-ords feature built-in, breathable 100% cotton batiste or viscose linings to ensure complete opacity without excessive weight.'
    },
    {
      q: 'How do I know which palette suits me best?',
      a: 'We recommend taking our 2-minute "Find Your Colors" assessment. It analyzes your undertone, natural contrast level, and jewellery affinities to match you with your optimal seasonal shades.'
    },
    {
      q: 'How do the no-snag hijab magnets work?',
      a: 'Unlike traditional pins that pierce and tear delicate modal and silk threads, our magnets use ultra-strong N52 neodymium magnetic force encased in hypoallergenic, nickel-free zinc alloy. They clamp through up to 4 fabric layers with zero punctures.'
    },
    {
      q: 'Can I track my order status?',
      a: 'Yes. Once your order is registered, you will receive an Order #NDXXXX reference. You can view your real-time tracking timeline anytime in your Client Account portal or via your confirmation link.'
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 border-b border-theme-border mb-10">
          <span className="text-xs font-bold uppercase tracking-editorial text-theme-muted block mb-2">
            Questions & Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-theme-text mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-theme-muted font-light max-w-md mx-auto">
            Everything you need to know about our textiles, sizing, and ordering.
          </p>
        </div>

        <div className="divide-y divide-theme-border border-y border-theme-border">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-5">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-sm font-medium text-theme-text"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-theme-muted transition-transform ${
                    openIndex === idx ? 'rotate-180 text-theme-text' : ''
                  }`}
                />
              </button>
              {openIndex === idx && (
                <p className="mt-3 text-xs text-theme-muted font-light leading-relaxed pr-6">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs text-theme-muted font-light leading-relaxed">
        <h1 className="text-3xl font-light text-theme-text mb-6">Privacy Policy</h1>
        <p>Last updated: March 2026</p>
        <p>
          NEEDLE Atelier (&ldquo;NEEDLE&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to honoring your digital privacy. This policy details how we collect, safeguard, and utilize customer information across our storefront.
        </p>
        <h2 className="text-sm font-semibold text-theme-text uppercase tracking-wider pt-4">Data Collection & Security</h2>
        <p>
          We collect standard order fulfillment data (name, delivery address, contact email and telephone) exclusively to process purchases and communicate tracking milestones. We never store raw payment credit card numbers; all payment transactions are routed through certified Level 1 PCI-DSS payment gateways.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-theme-bg text-theme-text pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs text-theme-muted font-light leading-relaxed">
        <h1 className="text-3xl font-light text-theme-text mb-6">Terms & Conditions</h1>
        <p>Last updated: March 2026</p>
        <p>
          By accessing and purchasing from NEEDLE, you agree to our standard commerce terms regarding catalog availability, order confirmation, and customer care policies.
        </p>
      </div>
    </div>
  );
};
