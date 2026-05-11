import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import DinoAvatar from './DinoAvatar';
import VoiceBars from './VoiceBars';

const TIPS = [
  'Say "Hey Dino" to wake me up anytime',
  'Ask about our special offers and discounts',
  'Book any cleaning service in under 2 minutes',
  'I remember your past bookings and preferences',
  'Deep cleaning, regular cleaning, sofa cleaning & more',
  'Available Mon–Sun, 8 AM to 8 PM across Hyderabad',
];

export default function IdleScreen({ onWake, isListening, isSupported, micError }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pts = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${4 + Math.random() * 8}px`,
      duration: `${8 + Math.random() * 12}s`,
      delay: `${Math.random() * 10}s`
    }));
    setParticles(pts);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-mesh">
      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay
          }}
        />
      ))}

      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #28a8ff, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />

      {/* Logo / Brand */}
      <motion.div
        className="absolute top-8 left-0 right-0 flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🧹</span>
          <span className="text-white font-bold text-xl tracking-wide">Urban Klean</span>
        </div>
        <p className="text-slate-400 text-xs tracking-widest uppercase">Clean Spaces, Happy Places</p>
      </motion.div>

      {/* Main avatar */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <DinoAvatar state={isListening ? 'listening' : 'idle'} size="xl" />
      </motion.div>

      {/* Main CTA text */}
      <motion.div
        className="text-center mb-6 px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          {isListening ? (
            <span className="text-gradient">Listening...</span>
          ) : (
            <>Say <span className="text-gradient">"Hey Dino"</span></>
          )}
        </h1>
        <p className="text-slate-400 text-lg">
          {isListening
            ? 'I\'m ready — what can I help you with?'
            : 'Your personal cleaning service assistant'}
        </p>
      </motion.div>

      {/* Voice bars (when listening) */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <VoiceBars active={isListening} color="blue" count={9} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic status / CTA button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {micError ? (
          <div className="flex items-center gap-2 text-red-400 glass px-4 py-2 rounded-xl">
            <MicOff className="w-4 h-4" />
            <span className="text-sm">{micError}</span>
          </div>
        ) : (
          <button
            onClick={onWake}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-200 active:scale-95"
            style={{
              background: isListening
                ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
                : 'linear-gradient(135deg, #0e8bf5, #28a8ff)'
            }}
          >
            {isListening
              ? <><Volume2 className="w-5 h-5" /> Listening</>
              : <><Mic className="w-5 h-5" /> Tap to Wake Dino</>
            }
          </button>
        )}
      </motion.div>

      {/* Rotating tips */}
      <motion.div
        className="absolute bottom-12 left-0 right-0 flex justify-center px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            className="glass px-5 py-2.5 rounded-full text-sm text-slate-300 text-center max-w-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            💡 {TIPS[tipIndex]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Supported indicator */}
      {!isSupported && (
        <div className="absolute bottom-4 text-xs text-amber-400">
          ⚠️ Use Chrome or Edge for voice features
        </div>
      )}
    </div>
  );
}
