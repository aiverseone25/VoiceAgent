import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, CreditCard, Headphones, Heart, HelpCircle, Home, MapPin, ShieldCheck, Star, UserRound } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

const SETTINGS = [
  { label: 'Saved addresses', sub: 'Home, office and society gate details', icon: MapPin },
  { label: 'Payment methods', sub: 'UPI, cards and invoices', icon: CreditCard },
  { label: 'Cleaning preferences', sub: 'Pet-safe products, allergies, notes', icon: Home },
  { label: 'Notifications', sub: 'Booking reminders and offers', icon: Bell },
  { label: 'Help and support', sub: 'Call, WhatsApp or chat with Dino', icon: HelpCircle },
];

export default function ProfileTabScreen({ customerName, customerPhone, onOpenDino }) {
  const name = customerName || 'Urban Klean Guest';
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full flex-col bg-gray-50 overflow-hidden">
      <div className="flex-shrink-0 bg-white" style={{ height: 59 }} />

      <div className="flex-shrink-0 bg-white px-4 pb-4">
        <div className="flex items-center justify-between">
          <CompanyLogo />
          <div className="text-right">
            <p className="text-brand-600 text-xs font-bold uppercase tracking-wide">Account</p>
            <h1 className="text-xl font-black text-gray-950">Profile</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <motion.div
          className="rounded-3xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#2e1065,#7c3aed)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-xl font-black border border-white/20">
              {customerName ? initials : <UserRound className="w-7 h-7" />}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black">{name}</h2>
              <p className="text-white/70 text-xs mt-1">{customerPhone || 'Add phone to view booking history'}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 bg-white/15 rounded-full px-2.5 py-1 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                Verified Urban Klean member
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ['12', 'Cleans', Star],
            ['4.9', 'Rating', Heart],
            ['Gold', 'Tier', ShieldCheck],
          ].map(([value, label, Icon]) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-gray-100">
              <Icon className="w-4 h-4 text-brand-600 mb-2" />
              <p className="text-gray-900 font-black">{value}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenDino}
          className="w-full bg-white rounded-3xl p-4 border border-gray-100 shadow-card flex items-center gap-3 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Headphones className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-gray-900">Need help?</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ask Dino about bookings, offers or services.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-card">
          {SETTINGS.map(({ label, sub, icon: Icon }, index) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 p-4 text-left ${index !== SETTINGS.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 truncate">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>

        <div className="text-center text-[10px] text-gray-400 pb-24">
          Urban Klean v1.0 · Clean Spaces, Happy Places
        </div>
      </div>
    </div>
  );
}
