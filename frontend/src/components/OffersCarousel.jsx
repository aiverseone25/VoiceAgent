import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock, Percent } from 'lucide-react';

function OfferCard({ offer, index }) {
  const isPercent = offer.discount_type === 'percent';
  const expiresDate = offer.valid_till
    ? new Date(offer.valid_till).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

  const gradients = [
    'from-blue-900/80 to-blue-800/50 border-blue-700/50',
    'from-teal-900/80 to-teal-800/50 border-teal-700/50',
    'from-purple-900/80 to-purple-800/50 border-purple-700/50',
    'from-amber-900/80 to-amber-800/50 border-amber-700/50',
  ];
  const gradient = gradients[index % gradients.length];

  const textColors = ['text-blue-300', 'text-teal-300', 'text-purple-300', 'text-amber-300'];
  const accentColor = textColors[index % textColors.length];

  return (
    <motion.div
      className={`flex-shrink-0 w-56 bg-gradient-to-br ${gradient} border rounded-2xl p-4 cursor-pointer`}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`text-2xl font-black ${accentColor}`}>
          {isPercent ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
          <span className="text-sm font-medium ml-0.5">OFF</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Percent className={`w-4 h-4 ${accentColor}`} />
        </div>
      </div>

      <h4 className="text-white font-semibold text-sm mb-1 leading-tight">{offer.title}</h4>
      <p className="text-slate-400 text-xs mb-3 leading-relaxed line-clamp-2">{offer.description}</p>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 ${accentColor} text-xs font-mono font-bold`}>
          <Tag className="w-3 h-3" />
          {offer.code}
        </div>
        {expiresDate && (
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock className="w-3 h-3" />
            {expiresDate}
          </div>
        )}
      </div>

      {offer.min_order > 0 && (
        <p className="text-slate-500 text-xs mt-2">Min. order ₹{offer.min_order}</p>
      )}
    </motion.div>
  );
}

export default function OffersCarousel({ offers }) {
  if (!offers?.length) return null;

  return (
    <div className="px-4 pb-2">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-amber-400" />
        <span className="text-slate-300 text-sm font-medium">Active Offers</span>
        <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
          {offers.length} available
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {offers.map((offer, i) => (
          <OfferCard key={offer.id} offer={offer} index={i} />
        ))}
      </div>
    </div>
  );
}
