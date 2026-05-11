import React, { useEffect, useState } from 'react';

const SCREEN_W = 393;
const SCREEN_H = 852;
const BEZEL    = 13;   // side bezel thickness px
const BEZEL_T  = 14;   // top bezel
const BEZEL_B  = 16;   // bottom bezel

// Battery icon (SVG inline)
function BatteryIcon({ pct = 82 }) {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35" />
      <rect x="1.5" y="1.5" width={Math.round(19 * pct / 100)} height="9" rx="2" fill="white" />
      <path d="M23 4v4a2 2 0 000-4z" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

// Signal bars
function SignalBars() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
      <rect x="0" y="7" width="3" height="5" rx="1" />
      <rect x="4.5" y="5" width="3" height="7" rx="1" />
      <rect x="9" y="3" width="3" height="9" rx="1" />
      <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.25" />
    </svg>
  );
}

// WiFi icon
function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
      <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
      <path d="M8 6.5C6.07 6.5 4.33 7.3 3.1 8.6l1.42 1.42A4.5 4.5 0 018 8.5a4.5 4.5 0 013.48 1.52l1.42-1.42A6.48 6.48 0 008 6.5z" opacity="0.75" />
      <path d="M8 3C5.1 3 2.49 4.2.73 6.15l1.42 1.42A7.96 7.96 0 018 5a7.96 7.96 0 015.85 2.57l1.42-1.42A9.96 9.96 0 008 3z" opacity="0.5" />
    </svg>
  );
}

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3, color: 'white' }}>{time}</span>;
}

export default function IPhoneFrame({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      const maxH = window.innerHeight  - 32;
      const maxW = window.innerWidth   - 32;
      const totalH = SCREEN_H + BEZEL_T + BEZEL_B;
      const totalW = SCREEN_W + BEZEL * 2;
      setScale(Math.min(maxH / totalH, maxW / totalW, 1));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const phoneH = SCREEN_H + BEZEL_T + BEZEL_B;
  const phoneW = SCREEN_W + BEZEL * 2;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // iOS-style dynamic wallpaper
        background: `
          radial-gradient(ellipse at 25% 20%, #7c3aed 0%, transparent 55%),
          radial-gradient(ellipse at 75% 80%, #4f46e5 0%, transparent 55%),
          radial-gradient(ellipse at 60% 30%, #9333ea 0%, transparent 45%),
          linear-gradient(145deg, #1a0a3d 0%, #2d1b69 40%, #1e1b4b 100%)
        `,
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow under phone */}
      <div style={{
        position: 'absolute',
        width: phoneW * scale + 80,
        height: phoneH * scale + 80,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* ─── iPhone shell ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: phoneW,
          height: phoneH,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        {/* Outer titanium bezel */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 54,
          background: 'linear-gradient(165deg, #5a5a5e 0%, #3a3a3c 25%, #2c2c2e 50%, #3a3a3c 75%, #5a5a5e 100%)',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.12),
            0 30px 80px rgba(0,0,0,0.7),
            0 10px 30px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.15),
            inset 0 -1px 0 rgba(0,0,0,0.3)
          `,
        }} />

        {/* Inner frame rim (ring around screen) */}
        <div style={{
          position: 'absolute',
          inset: BEZEL - 2,
          borderRadius: 46,
          background: '#1c1c1e',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)',
        }} />

        {/* ── Left side buttons ────────────────────────────────────────── */}
        {/* Silent switch */}
        <div style={{
          position: 'absolute',
          left: -4,
          top: 100,
          width: 4,
          height: 30,
          borderRadius: '3px 0 0 3px',
          background: 'linear-gradient(180deg, #4a4a4c, #3a3a3c, #4a4a4c)',
          boxShadow: '-1px 0 3px rgba(0,0,0,0.5)',
        }} />
        {/* Vol up */}
        <div style={{
          position: 'absolute',
          left: -4,
          top: 148,
          width: 4,
          height: 52,
          borderRadius: '3px 0 0 3px',
          background: 'linear-gradient(180deg, #4a4a4c, #3a3a3c, #4a4a4c)',
          boxShadow: '-1px 0 3px rgba(0,0,0,0.5)',
        }} />
        {/* Vol down */}
        <div style={{
          position: 'absolute',
          left: -4,
          top: 212,
          width: 4,
          height: 52,
          borderRadius: '3px 0 0 3px',
          background: 'linear-gradient(180deg, #4a4a4c, #3a3a3c, #4a4a4c)',
          boxShadow: '-1px 0 3px rgba(0,0,0,0.5)',
        }} />

        {/* ── Right side button (power) ────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          right: -4,
          top: 170,
          width: 4,
          height: 80,
          borderRadius: '0 3px 3px 0',
          background: 'linear-gradient(180deg, #4a4a4c, #3a3a3c, #4a4a4c)',
          boxShadow: '1px 0 3px rgba(0,0,0,0.5)',
        }} />

        {/* ── Screen area ──────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          top: BEZEL_T,
          left: BEZEL,
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 44,
          overflow: 'hidden',
          background: '#f5f3ff',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
        }}>

          {/* App content fills the full screen */}
          <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {children}
          </div>

          {/* ── Dynamic Island ────────────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 126,
            height: 37,
            borderRadius: 20,
            background: '#000',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
          }}>
            {/* Front camera dot */}
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a1a1a', boxShadow: 'inset 0 0 0 2px #2a2a2a' }} />
            {/* Face ID sensors */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a1a1a' }} />
              <div style={{ width: 4, height: 16, borderRadius: 2, background: '#1a1a1a' }} />
            </div>
          </div>

          {/* ── Status bar ────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 59,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0 24px 8px',
            zIndex: 99,
            pointerEvents: 'none',
          }}>
            {/* Time */}
            <div style={{ minWidth: 60 }}>
              <Clock />
            </div>
            {/* Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SignalBars />
              <WifiIcon />
              <BatteryIcon pct={82} />
            </div>
          </div>

          {/* ── Home indicator ────────────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 5,
            borderRadius: 3,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 100,
            pointerEvents: 'none',
          }} />
        </div>

        {/* ── Bottom speaker grille ────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 3,
          alignItems: 'center',
        }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
            }} />
          ))}
        </div>

        {/* Lightning port */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 36,
          height: 6,
          borderRadius: 3,
          background: '#111',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
        }} />
      </div>
    </div>
  );
}
