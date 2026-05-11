import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2, Clock, CreditCard, MapPin, Plus, Sparkles } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

const MOCK_BOOKINGS = [
  {
    booking_ref: 'UKL-DEMO92A',
    service_name: 'Bathroom Deep Cleaning',
    variant: '2 bathrooms',
    scheduled_date: '2026-05-14',
    time_slot: '09:00 AM - 12:00 PM',
    address: 'Tank Bund Road, Hyderabad',
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 849,
  },
  {
    booking_ref: 'UKL-DEMO77K',
    service_name: 'Premium Home Deep Cleaning',
    variant: '2BHK',
    scheduled_date: '2026-05-18',
    time_slot: '01:00 PM - 04:00 PM',
    address: 'Jubilee Hills, Hyderabad',
    status: 'scheduled',
    payment_status: 'pending',
    total_amount: 2999,
  },
];

function BookingCard({ booking, index }) {
  const paid = booking.payment_status === 'paid';
  return (
    <motion.div
      className="bg-white rounded-3xl p-4 border border-gray-100 shadow-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] text-gray-400 font-mono">{booking.booking_ref}</p>
          <h3 className="text-gray-900 font-bold text-sm mt-0.5">{booking.service_name}</h3>
          <p className="text-brand-600 text-xs font-semibold">{booking.variant}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${paid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {paid ? 'Paid' : 'Pay pending'}
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-3.5 h-3.5 text-brand-500" />
          {new Date(booking.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          {booking.time_slot}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          <span className="truncate">{booking.address}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
        <span className="text-gray-900 font-black">₹{booking.total_amount}</span>
        <button className="text-brand-600 text-xs font-bold">View details</button>
      </div>
    </motion.div>
  );
}

export default function BookingTabScreen({ currentBooking, bookingHistory = [], onOpenDino }) {
  const bookings = [
    ...(currentBooking ? [currentBooking] : []),
    ...(bookingHistory?.length ? bookingHistory : MOCK_BOOKINGS),
  ];

  return (
    <div className="flex h-full flex-col bg-gray-50 overflow-hidden">
      <div className="flex-shrink-0 bg-white" style={{ height: 59 }} />

      <div className="flex-shrink-0 bg-white px-4 pb-4">
        <div className="flex items-center justify-between">
          <CompanyLogo />
          <button
            onClick={onOpenDino}
            className="w-11 h-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-purple"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        <div className="rounded-3xl p-4 text-white overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#2e1065,#7c3aed)' }}>
          <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">Bookings</p>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-xs font-semibold text-white/80">Fast booking</span>
            </div>
            <h2 className="text-lg font-black">Ask Dino to schedule any cleaning</h2>
            <p className="text-xs text-white/70 mt-1 mb-3">Try: "Book bathroom cleaning tomorrow morning."</p>
            <button onClick={onOpenDino} className="px-4 py-2 rounded-full bg-white text-brand-700 text-xs font-bold">
              Book with Dino
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ['Confirmed', bookings.length, CheckCircle2],
            ['This week', 2, CalendarCheck],
            ['Pending pay', bookings.filter(b => b.payment_status !== 'paid').length, CreditCard],
          ].map(([label, value, Icon]) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-gray-100">
              <Icon className="w-4 h-4 text-brand-600 mb-2" />
              <p className="text-gray-900 font-black">{value}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Upcoming</h2>
            <button onClick={onOpenDino} className="text-brand-600 text-xs font-bold">Need help?</button>
          </div>
          <div className="space-y-3">
            {bookings.map((booking, index) => (
              <BookingCard key={booking.booking_ref || booking.id || index} booking={booking} index={index} />
            ))}
          </div>
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}
