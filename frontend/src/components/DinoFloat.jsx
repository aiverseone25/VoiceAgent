import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Floating Dino assistant button — uses the Dino character image.
 * Place the Dino image at: frontend/public/dino.png
 */
export default function DinoFloat({ onClick, state = 'idle' }) {
  const isListening = state === 'listening';
  const isSpeaking  = state === 'speaking';
  const isProcessing = state === 'processing';
  const isActive    = isListening || isSpeaking;

  // Ring color by state
  const ringColor = isSpeaking
    ? 'rgba(20,184,166,0.7)'
    : isListening
    ? 'rgba(124,58,237,0.7)'
    : 'rgba(124,58,237,0.4)';

  // Glow color
  const glowColor = isSpeaking
    ? 'rgba(20,184,166,0.35)'
    : 'rgba(124,58,237,0.35)';

  // Status label
  const label = isSpeaking ? 'Speaking' : isListening ? 'Listening' : isProcessing ? 'Thinking' : 'DINO';

  return (
    <div className="absolute bottom-24 right-4 z-40 flex items-center justify-center">

      {/* Ripple rings when active */}
      <AnimatePresence>
        {isActive && [0, 1].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: 64, height: 64, border: `2px solid ${ringColor}` }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.65, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Slow idle pulse */}
      {!isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{ width: 64, height: 64, background: 'rgba(124,58,237,0.2)' }}
          animate={{ scale: [1, 1.45, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Glow shadow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 64, height: 64, background: glowColor, filter: 'blur(12px)' }}
        animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.3 }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />

      {/* Main button */}
      <motion.button
        onClick={onClick}
        className="relative w-16 h-16 rounded-full overflow-hidden select-none"
        style={{
          background: 'linear-gradient(145deg, #7c3aed, #5b21b6)',
          boxShadow: '0 8px 28px rgba(124,58,237,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          border: '2.5px solid rgba(255,255,255,0.25)',
        }}
        animate={!isActive ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.1 }}
      >
        {/* Dino character image */}
        <img
          src="/dino.png"
          alt="Dino"
          className="w-full h-full object-cover object-top"
          onError={e => {
            // Fallback emoji if image not found
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Emoji fallback (hidden by default) */}
        <div
          className="absolute inset-0 items-center justify-center text-3xl bg-gradient-to-b from-brand-500 to-brand-700"
          style={{ display: 'none' }}
        >
          🦖
        </div>

        {/* State overlay tint */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0"
              style={{
                background: isSpeaking
                  ? 'rgba(13,148,136,0.25)'
                  : 'rgba(124,58,237,0.25)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Speaking equalizer bars overlay at bottom */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-0.5 pb-1 px-2"
              style={{ height: 18, background: 'rgba(0,0,0,0.3)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.div
                  key={i}
                  style={{ width: 2.5, borderRadius: 2, background: '#fff' }}
                  animate={{ height: [3, 10 + Math.random() * 8, 3] }}
                  transition={{ duration: 0.5 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Status chip */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-white text-[9px] font-bold tracking-wide"
        style={{
          background: isSpeaking ? '#0d9488' : isListening ? '#7c3aed' : isProcessing ? '#6d28d9' : '#7c3aed',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
        key={state}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.div>

      {/* Tooltip when idle */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            className="absolute right-[72px] bottom-3 bg-white rounded-2xl px-3 py-2 whitespace-nowrap pointer-events-none"
            style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.2)' }}
            initial={{ opacity: 0, x: 8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.9 }}
            transition={{ delay: 2, duration: 0.3 }}
          >
            <p className="text-gray-700 text-xs font-semibold">Say <span className="text-brand-600">"Hey Dino"</span> 👋</p>
            {/* Tail */}
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rotate-45"
              style={{ boxShadow: '2px -2px 4px rgba(124,58,237,0.1)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
