import React from 'react';
import { motion } from 'framer-motion';
import { BadgePercent, CalendarDays, Copy, Gift, Sparkles, Tag, TicketPercent } from 'lucide-react';
import toast from 'react-hot-toast';
import CompanyLogo from './CompanyLogo';

const FALLBACK_OFFERS = [
  {
    id: 'first',
    code: 'FIRSTKLEAN',
    title: 'First Booking Discount',
    description: 'Get 20% off on your first Urban Klean booking.',
    discount_type: 'percent',
    discount_value: 20,
    min_order: 500,
    max_discount: 500,
    valid_till: '2027-12-31',
  },
  {
    id: 'bath',
    code: 'BATHROOM99',
    title: 'Bathroom Add-on Deal',
    description: 'Flat 99 rupees off on bathroom deep cleaning above 499 rupees.',
    discount_type: 'flat',
    discount_value: 99,
    min_order: 499,
    max_discount: 99,
    valid_till: '2027-12-31',
  },
];

function copyCode(code) {
  navigator.clipboard?.writeText(code).then(
    () => toast.success(`${code} copied`),
    () => toast(`${code} copied`)
  );
}

function OfferCard({ offer, index, onOpenDino }) {
  const isPercent = offer.discount_type === 'percent';
  const value = isPercent ? `${offer.discount_value}%` : `₹${offer.discount_value}`;
  const gradient = [
    'linear-gradient(135deg,#4c1d95,#7c3aed)',
    'linear-gradient(135deg,#064e3b,#0d9488)',
    'linear-gradient(135deg,#7c2d12,#f97316)',
    'linear-gradient(135deg,#831843,#db2777)',
  ][index % 4];

  return (
    <motion.div
      className="rounded-3xl p-4 text-white relative overflow-hidden"
      style={{ background: gradient }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-[10px] uppercase tracking-wide font-bold">Save</p>
            <div className="text-4xl font-black leading-none mt-1">{value}</div>
            <p className="text-sm font-bold mt-1">OFF</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
            <TicketPercent className="w-5 h-5" />
          </div>
        </div>

        <h3 className="font-black text-base mt-4">{offer.title}</h3>
        <p className="text-white/75 text-xs leading-relaxed mt-1">{offer.description}</p>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => copyCode(offer.code)}
            className="flex items-center gap-2 bg-white text-brand-700 px-3 py-2 rounded-2xl text-xs font-black"
          >
            <Copy className="w-3.5 h-3.5" />
            {offer.code}
          </button>
          <button onClick={onOpenDino} className="text-white text-xs font-bold underline underline-offset-4">
            Use now
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 text-[10px] text-white/70">
          {offer.min_order > 0 && <span>Min ₹{offer.min_order}</span>}
          {offer.max_discount > 0 && <span>Max ₹{offer.max_discount}</span>}
          {offer.valid_till && (
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              Till {new Date(offer.valid_till).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function OffersTabScreen({ offers = [], onOpenDino }) {
  const activeOffers = offers.length ? offers : FALLBACK_OFFERS;

  return (
    <div className="flex h-full flex-col bg-gray-50 overflow-hidden">
      <div className="flex-shrink-0 bg-white" style={{ height: 59 }} />

      <div className="flex-shrink-0 bg-white px-4 pb-4">
        <div className="flex items-center justify-between">
          <CompanyLogo />
          <div className="text-right">
            <p className="text-brand-600 text-xs font-bold uppercase tracking-wide">Savings</p>
            <h1 className="text-xl font-black text-gray-950">Offers</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Gift className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-gray-900">Best offer auto-applied</h2>
              <p className="text-xs text-gray-500 mt-0.5">Dino can pick the best coupon for your booking.</p>
            </div>
          </div>
          <button
            onClick={onOpenDino}
            className="mt-4 w-full py-3 rounded-2xl bg-brand-600 text-white text-sm font-bold shadow-purple"
          >
            Ask Dino for best deal
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            [activeOffers.length, 'Active', BadgePercent],
            ['₹750', 'Max save', Sparkles],
            ['24/7', 'Apply', Tag],
          ].map(([value, label, Icon]) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-gray-100">
              <Icon className="w-4 h-4 text-brand-600 mb-2" />
              <p className="text-gray-900 font-black">{value}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {activeOffers.map((offer, index) => (
            <OfferCard key={offer.id || offer.code} offer={offer} index={index} onOpenDino={onOpenDino} />
          ))}
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}
