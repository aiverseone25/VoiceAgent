import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Bell, MapPin,
  ChevronDown, ChevronRight, Star, Home,
  Calendar, Tag, User, Sparkles
} from 'lucide-react';

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
  { label: 'Cleaning',  icon: '🧹' },
  { label: 'Sevaks',    icon: '👤' },
  { label: 'AC Repair', icon: '❄️' },
  { label: 'Kitchen',   icon: '🍳' },
  { label: 'Bathroom',  icon: '🚿' },
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
        <span className="text-5xl">{service.icon}</span>
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

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',    icon: Home,     key: 'home' },
  { label: 'Booking', icon: Calendar, key: 'booking' },
  { label: 'Offers',  icon: Tag,      key: 'offers' },
  { label: 'Profile', icon: User,     key: 'profile' },
];

function BottomNav({ active, onChange }) {
  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100 px-2" style={{ paddingBottom: 20 }}>
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ label, icon: Icon, key }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-col items-center gap-0.5 py-3 px-4 relative"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute bottom-1.5 w-1 h-1 rounded-full bg-brand-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export default function HomeScreen({ services, offers, onBookService, onOpenDino }) {
  const [navTab, setNavTab] = useState('home');
  const [search, setSearch] = useState('');

  const displayServices = search
    ? services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : services;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* ── Spacer for Dynamic Island + status bar (59px) ── */}
      <div className="flex-shrink-0 bg-white" style={{ height: 59 }} />

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white flex items-center justify-between px-4 pb-3">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-sm">My House</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <p className="text-gray-400 text-[11px]">Tank Bund Road, Hyderabad</p>
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

        {/* Offer banner */}
        <OfferBanner offers={offers} />

        {/* Explore Services */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-gray-900 text-base">Explore Services</h3>
            <button className="flex items-center gap-0.5 text-brand-600 text-xs font-semibold">
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
              <button className="flex items-center gap-0.5 text-brand-600 text-xs font-semibold">
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

      {/* ── Bottom Nav ── */}
      <BottomNav active={navTab} onChange={setNavTab} />
    </div>
  );
}
