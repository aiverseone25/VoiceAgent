import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Bell, MapPin,
  ChevronDown, ChevronRight, Star, Tag
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';

// ─── Hero Carousel ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    tag: 'Make Your House',
    title: 'SPARKLE',
    sub: 'Professional cleaning in\nas little as 60 minutes',
    cta: 'Book a Cleaning',
    bg: 'from-purple-100 to-violet-50',
    accent: '#7c3aed',
    emoji: '🛋️',
    badge: '5,000+ Happy Homes · Cleaned by experts'
  },
  {
    tag: 'Special Offer Today',
    title: 'SAVE ₹200',
    sub: 'On your first deep\ncleaning booking',
    cta: 'Claim Now',
    bg: 'from-violet-100 to-purple-50',
    accent: '#6d28d9',
    emoji: '✨',
    badge: 'Use code FIRSTKLEAN · Limited time'
  }
];

function HeroCarousel({ onBook }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[idx];

  return (
    <div className="mx-4 mb-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${slide.bg} p-5`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          style={{ minHeight: 172 }}
        >
          {/* Text side */}
          <div className="max-w-[58%]">
            <p className="text-gray-500 text-xs font-medium mb-0.5">{slide.tag}</p>
            <h2 className="font-black text-3xl leading-none mb-1.5" style={{ color: slide.accent }}>
              {slide.title}
            </h2>
            <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line mb-3">
              {slide.sub}
            </p>
            <button
              onClick={onBook}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold shadow-purple"
              style={{ background: slide.accent }}
            >
              {slide.cta}
            </button>
            <p className="text-gray-400 text-[10px] mt-2 flex items-center gap-1">
              <span className="text-green-500">●</span> {slide.badge}
            </p>
          </div>

          {/* Illustration emoji */}
          <div
            className="absolute right-4 bottom-4 text-8xl select-none"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(109,40,217,0.2))' }}
          >
            {slide.emoji}
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === idx ? 'w-5 h-1.5 bg-violet-600' : 'w-1.5 h-1.5 bg-violet-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Category Pills ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Full Home', icon: '🏠' },
  { label: 'Bathroom',  icon: '🚿' },
  { label: 'Kitchen',   icon: '🍳' },
  { label: 'Sofa',      icon: '🛋️' },
  { label: 'Office',    icon: '🏢' },
  { label: 'Clinic',    icon: '🏥' },
];

function CategoryPills() {
  const [active, setActive] = useState('Cleaning');
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1">
      {CATEGORIES.map(c => (
        <button
          key={c.label}
          onClick={() => setActive(c.label)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === c.label
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          <span>{c.icon}</span> {c.label}
        </button>
      ))}
    </div>
  );
}

// ─── Offer Banner ─────────────────────────────────────────────────────────────
function OfferBanner({ offers }) {
  const offer = offers?.[0];
  return (
    <div className="mx-4 mb-4">
      <div
        className="flex items-center gap-4 rounded-2xl px-5 py-4"
        style={{ background: 'linear-gradient(135deg, #1a0533 0%, #3b0764 100%)' }}
      >
        <div className="text-4xl animate-bounce-soft">🎁</div>
        <div className="flex-1">
          <p className="text-gray-300 text-[10px] mb-0.5 uppercase tracking-wide">Limited Offer</p>
          <p className="text-white font-black text-xl leading-tight">
            {offer ? `SAVE ₹${offer.discount_type === 'flat' ? offer.discount_value : '100'}` : 'SAVE ₹100'}
          </p>
          <p className="text-gray-400 text-[10px] mt-0.5">
            {offer?.description || 'Book 2 services &'}{' '}
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-white text-xs font-bold flex-shrink-0"
          style={{ background: '#7c3aed' }}
        >
          {offer ? `USE ${offer.code}` : 'SAVE ₹100'}
        </div>
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
const BG_COLORS = [
  'bg-purple-50',
  'bg-violet-50',
  'bg-indigo-50',
  'bg-pink-50',
  'bg-blue-50',
  'bg-teal-50',
  'bg-amber-50',
  'bg-green-50',
];

const SERVICE_ICONS = {
  home: '🏠',
  sparkles: '✨',
  bath: '🚿',
  kitchen: '🍳',
  bed: '🛏️',
  sofa: '🛋️',
  balcony: '🌿',
  key: '🔑',
  tools: '🧰',
  carpet: '🧼',
  mattress: '🛏️',
  curtain: '🪟',
  window: '🪟',
  appliance: '🧊',
  chimney: '♨️',
  tank: '💧',
  floor: '✨',
  shield: '🛡️',
  office: '🏢',
  clinic: '🏥',
  restaurant: '🍽️',
  store: '🛍️',
  building: '🏬',
  event: '🎉',
  vent: '❄️',
  fan: '🌀',
};

function serviceIcon(icon) {
  if (!icon) return '🧹';
  return SERVICE_ICONS[icon] || icon;
}

function ServiceCard({ service, index, onBook }) {
  const minPrice = Object.values(service.pricing_variants || {})[0] || service.base_price;
  const bg = BG_COLORS[index % BG_COLORS.length];

  return (
    <motion.button
      onClick={() => onBook(service)}
      className={`flex-shrink-0 w-36 ${bg} rounded-2xl overflow-hidden shadow-card text-left`}
      whileTap={{ scale: 0.96 }}
    >
      {/* "Best Seller" badge */}
      {index < 2 && (
        <div className="absolute top-2 left-2 z-10 bg-amber-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
          Best Seller
        </div>
      )}
      <div className="relative h-24 flex items-center justify-center">
        <span className="text-5xl">{serviceIcon(service.icon)}</span>
      </div>
      <div className="px-3 pb-3">
        <p className="text-gray-800 font-semibold text-xs leading-tight mb-0.5">{service.name}</p>
        <p className="text-brand-600 text-xs font-bold">from ₹{minPrice}</p>
        <div className="flex items-center gap-0.5 mt-1">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-gray-400 text-[10px]">4.8 (2k+)</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export default function HomeScreen({ services = [], offers = [], onBookService, onOpenDino, onSeeAllServices, onOpenOffers }) {
  const [search, setSearch] = useState('');

  const categories = [
    { label: 'All', value: 'all', count: services.length },
    { label: 'Home', value: 'home', count: services.filter(s => s.category === 'home').length },
    { label: 'Specialty', value: 'specialty', count: services.filter(s => s.category === 'specialty').length },
    { label: 'Commercial', value: 'commercial', count: services.filter(s => s.category === 'commercial').length },
  ];

  const displayServices = search
    ? services.filter(s => [
      s.name,
      s.description,
      s.category,
      ...(s.aliases || []),
    ].join(' ').toLowerCase().includes(search.toLowerCase()))
    : services;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ── Spacer for Dynamic Island + status bar (59px) ── */}
      <div className="flex-shrink-0 bg-white" style={{ height: 59 }} />

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyLogo size="sm" showName={false} />
          <div className="flex items-start gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900 text-sm">My House</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <p className="text-gray-400 text-[11px] truncate">Tank Bund Road, Hyderabad</p>
            </div>
          </div>
        </div>
        <button className="relative w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
          <Bell className="w-4.5 h-4.5 text-brand-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* Hero */}
        <HeroCarousel onBook={onOpenDino} />

        {/* Trust strip */}
        <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
          {[
            ['50k+', 'Customers'],
            ['4.8', 'Rating'],
            ['27', 'Services'],
          ].map(([value, label]) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-card">
              <p className="text-gray-900 font-black text-base">{value}</p>
              <p className="text-gray-400 text-[10px]">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mx-4 mb-4 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-card border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services, pros..."
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
          <button className="w-11 h-11 rounded-2xl bg-white shadow-card border border-gray-100 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Category pills */}
        <div className="mb-4">
          <CategoryPills />
        </div>

        {/* Service groups */}
        <div className="mx-4 mb-4 grid grid-cols-4 gap-2">
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setSearch(c.value === 'all' ? '' : c.value)}
              className="bg-white border border-gray-100 rounded-2xl px-2 py-3 text-center shadow-card"
            >
              <p className="text-gray-900 text-sm font-black">{c.count}</p>
              <p className="text-gray-400 text-[10px]">{c.label}</p>
            </button>
          ))}
        </div>

        {/* Offer banner */}
        <OfferBanner offers={offers} />

        {/* Explore Services */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-gray-900 text-base">Explore Services</h3>
            <button onClick={onSeeAllServices} className="flex items-center gap-0.5 text-brand-600 text-xs font-semibold">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
            {displayServices.map((svc, i) => (
              <div key={svc.id} className="relative flex-shrink-0">
                <ServiceCard service={svc} index={i} onBook={onBookService} />
              </div>
            ))}
          </div>
        </div>

        {/* Active offers strip */}
        {offers.length > 0 && (
          <div className="mb-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-base">Active Offers</h3>
              <button onClick={onOpenOffers} className="flex items-center gap-0.5 text-brand-600 text-xs font-semibold">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {offers.slice(0, 3).map(offer => (
                <div
                  key={offer.id}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{offer.title}</p>
                    <p className="text-gray-400 text-[11px] truncate">{offer.description}</p>
                  </div>
                  <div className="flex-shrink-0 bg-brand-50 border border-brand-200 px-2 py-1 rounded-lg">
                    <span className="text-brand-600 text-xs font-bold font-mono">{offer.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom padding so FAB doesn't overlap last item */}
        <div className="h-20" />
      </div>

    </div>
  );
}
