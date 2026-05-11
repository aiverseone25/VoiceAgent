import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Home, Tag, User } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, key: 'home' },
  { label: 'Booking', icon: Calendar, key: 'booking' },
  { label: 'Offers', icon: Tag, key: 'offers' },
  { label: 'Profile', icon: User, key: 'profile' },
];

export default function AppBottomNav({ active, onChange }) {
  return (
    <div className="flex-shrink-0 bg-white/95 border-t border-gray-100 px-2" style={{ paddingBottom: 20 }}>
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
