import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const categoryLabels = { home: 'Home', specialty: 'Specialty', commercial: 'Commercial' };
const categoryColors = {
  home: 'from-blue-900/60 to-blue-800/40 border-blue-700/40',
  specialty: 'from-teal-900/60 to-teal-800/40 border-teal-700/40',
  commercial: 'from-purple-900/60 to-purple-800/40 border-purple-700/40'
};

function ServiceCard({ service, index }) {
  const [expanded, setExpanded] = useState(false);
  const variants = Object.entries(service.pricing_variants || {});
  const minPrice = variants.length > 0 ? Math.min(...variants.map(([, v]) => v)) : service.base_price;

  return (
    <motion.div
      className={`bg-gradient-to-br ${categoryColors[service.category] || categoryColors.home} border rounded-2xl overflow-hidden cursor-pointer`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{service.icon}</span>
            <div className="min-w-0">
              <h4 className="text-white font-semibold text-sm leading-tight">{service.name}</h4>
              <p className="text-slate-400 text-xs mt-0.5">from ₹{minPrice}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              service.category === 'home' ? 'bg-blue-500/20 text-blue-300' :
              service.category === 'specialty' ? 'bg-teal-500/20 text-teal-300' :
              'bg-purple-500/20 text-purple-300'
            }`}>
              {categoryLabels[service.category]}
            </span>
            {expanded
              ? <ChevronUp className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />
            }
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="text-slate-400 text-xs mt-3 leading-relaxed">{service.description}</p>

              {variants.length > 0 && (
                <div className="mt-3">
                  <p className="text-slate-500 text-xs mb-2 font-medium">PRICING</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {variants.map(([label, price]) => (
                      <div key={label} className="flex justify-between bg-white/5 rounded-lg px-2.5 py-1.5">
                        <span className="text-slate-400 text-xs">{label}</span>
                        <span className="text-white text-xs font-semibold">₹{price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {service.highlights?.length > 0 && (
                <div className="mt-3">
                  <p className="text-slate-500 text-xs mb-2 font-medium">INCLUDES</p>
                  <div className="space-y-1">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-emerald-400">✓</span>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ServicesGrid({ services, onClose }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? services : services.filter(s => s.category === filter);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm glass rounded-3xl overflow-hidden max-h-[85vh] flex flex-col"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-clean-border"
          style={{ background: 'linear-gradient(135deg, #0f2040, #1e3a6b)' }}>
          <h3 className="text-white font-bold">Our Services</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter */}
        <div className="px-4 py-3 flex gap-2 border-b border-clean-border overflow-x-auto scrollbar-hide">
          {['all', 'home', 'specialty', 'commercial'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
          {filtered.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
        </div>
      </motion.div>
    </motion.div>
  );
}
