import React from 'react';

export default function CompanyLogo({ size = 'md', showName = true }) {
  const dimensions = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dimensions} rounded-2xl bg-black overflow-hidden border border-brand-100 shadow-card flex items-center justify-center`}>
        <img src="/uk_logo.png" alt="Urban Klean" className="w-full h-full object-cover" />
      </div>
      {showName && (
        <div>
          <p className="text-gray-950 text-sm font-black leading-tight">Urban Klean</p>
          <p className="text-brand-600 text-[10px] font-bold uppercase tracking-wide">Premium cleaning</p>
        </div>
      )}
    </div>
  );
}
