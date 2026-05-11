import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, X } from 'lucide-react';

const statusConfig = {
  confirmed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle, label: 'Confirmed' },
  pending:   { color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: AlertCircle, label: 'Pending' },
  cancelled: { color: 'text-red-400',     bg: 'bg-red-400/10',     icon: XCircle,     label: 'Cancelled' },
  completed: { color: 'text-blue-400',    bg: 'bg-blue-400/10',    icon: CheckCircle, label: 'Completed' },
};

function BookingCard({ booking, index }) {
  const cfg = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      className="glass rounded-2xl p-4 cursor-pointer hover:border-brand-700/60 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold text-sm truncate">{booking.service_name || booking.service}</span>
            {booking.variant && (
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full flex-shrink-0">
                {booking.variant}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(booking.scheduled_date || booking.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {(booking.time_slot || booking.slot)?.split(' - ')[0]}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-white font-bold text-sm">₹{booking.total_amount || booking.total}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.color} ${cfg.bg}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </div>
        </div>
      </div>

      {booking.booking_ref && (
        <p className="text-slate-600 text-xs font-mono mt-2">{booking.booking_ref}</p>
      )}
    </motion.div>
  );
}

export default function BookingHistory({ bookings, onClose, customerName }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm glass rounded-3xl overflow-hidden max-h-[80vh] flex flex-col"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-clean-border"
          style={{ background: 'linear-gradient(135deg, #0f2040, #1e3a6b)' }}>
          <div>
            <h3 className="text-white font-bold">Booking History</h3>
            {customerName && <p className="text-slate-400 text-xs">{customerName}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
          {bookings?.length > 0 ? (
            bookings.map((b, i) => <BookingCard key={b.booking_ref || b.id || i} booking={b} index={i} />)
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-400 text-sm">No past bookings found.</p>
              <p className="text-slate-500 text-xs mt-1">Book your first cleaning today!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
