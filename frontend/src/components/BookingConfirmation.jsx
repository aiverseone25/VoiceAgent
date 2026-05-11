import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, MapPin, CreditCard, X, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function BookingConfirmation({ booking, onClose, onPaymentDone }) {
  const [paying, setPaying] = useState(false);

  const handlePayment = async () => {
    if (!booking?.booking_ref) return;
    setPaying(true);

    try {
      const { data } = await axios.post('/api/payment/create-order', {
        booking_ref: booking.booking_ref,
        amount: booking.total_amount
      });

      if (data.demo_mode) {
        // Demo: simulate payment
        await axios.post('/api/payment/verify', {
          razorpay_order_id: data.order_id,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo',
          booking_ref: booking.booking_ref
        });
        toast.success('Payment successful! (Demo Mode)');
        onPaymentDone?.({ ...booking, payment_status: 'paid' });
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Urban Klean',
        description: booking.service_name,
        order_id: data.order_id,
        theme: { color: '#0e8bf5' },
        handler: async (response) => {
          await axios.post('/api/payment/verify', {
            ...response,
            booking_ref: booking.booking_ref
          });
          toast.success('Payment successful!');
          onPaymentDone?.({ ...booking, payment_status: 'paid' });
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (!booking) return null;

  const isPaid = booking.payment_status === 'paid';

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm glass rounded-3xl overflow-hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div
          className="px-5 py-5 text-center relative"
          style={{ background: isPaid ? 'linear-gradient(135deg, #065f46, #0d9488)' : 'linear-gradient(135deg, #1e3a6b, #0e8bf5)' }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle className={`w-12 h-12 mx-auto mb-2 ${isPaid ? 'text-emerald-300' : 'text-blue-200'}`} />
          </motion.div>
          <h3 className="text-white font-bold text-lg">{isPaid ? 'Booking Confirmed!' : 'Booking Created'}</h3>
          <p className="text-white/70 text-sm font-mono mt-1">{booking.booking_ref}</p>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <div className="glass-light rounded-2xl p-4 space-y-3">
            <DetailRow icon={<span className="text-lg">{booking.service_icon || '🧹'}</span>} label="Service" value={`${booking.service_name}${booking.variant ? ` (${booking.variant})` : ''}`} />
            <DetailRow icon={<Calendar className="w-4 h-4 text-brand-400" />} label="Date" value={new Date(booking.scheduled_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} />
            <DetailRow icon={<Clock className="w-4 h-4 text-teal-400" />} label="Time" value={booking.time_slot} />
            <DetailRow icon={<MapPin className="w-4 h-4 text-rose-400" />} label="Address" value={booking.address} truncate />
          </div>

          {/* Pricing */}
          <div className="glass-light rounded-2xl p-4">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Subtotal</span>
              <span>₹{booking.base_amount}</span>
            </div>
            {booking.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400 mb-1">
                <span>Discount ({booking.offer_code})</span>
                <span>-₹{booking.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-base border-t border-white/10 pt-2 mt-2">
              <span>Total</span>
              <span>₹{booking.total_amount}</span>
            </div>
            <div className={`text-xs mt-1 text-right ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isPaid ? '✅ Payment Received' : '⏳ Payment Pending'}
            </div>
          </div>

          {/* Pay button */}
          {!isPaid && (
            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white disabled:opacity-60 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0e8bf5, #14b8a6)' }}
            >
              {paying
                ? <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
                : <><CreditCard className="w-4 h-4" /> Pay ₹{booking.total_amount}</>
              }
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({ icon, label, value, truncate }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-slate-500 text-xs">{label}</span>
        <p className={`text-slate-200 text-sm font-medium ${truncate ? 'truncate' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
