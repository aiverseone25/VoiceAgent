import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DinoAvatar({ state, size = 'lg' }) {
  const sizes = {
    sm: { outer: 'w-16 h-16', inner: 'w-12 h-12', text: 'text-2xl', ring: 'w-20 h-20' },
    md: { outer: 'w-24 h-24', inner: 'w-18 h-18', text: 'text-3xl', ring: 'w-32 h-32' },
    lg: { outer: 'w-36 h-36', inner: 'w-28 h-28', text: 'text-5xl', ring: 'w-48 h-48' },
    xl: { outer: 'w-48 h-48', inner: 'w-36 h-36', text: 'text-6xl', ring: 'w-64 h-64' },
  };
  const s = sizes[size];

  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';
  const isIdle = state === 'idle';

  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple rings when listening */}
      <AnimatePresence>
        {(isListening || isSpeaking) && (
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-brand-400"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeOut'
                }}
                style={{ width: '100%', height: '100%' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Outer glow ring */}
      <motion.div
        className={`${s.outer} relative rounded-full flex items-center justify-center`}
        animate={isListening
          ? { boxShadow: ['0 0 20px rgba(40,168,255,0.4)', '0 0 60px rgba(40,168,255,0.8)', '0 0 20px rgba(40,168,255,0.4)'] }
          : isSpeaking
          ? { boxShadow: ['0 0 20px rgba(20,184,166,0.4)', '0 0 60px rgba(20,184,166,0.8)', '0 0 20px rgba(20,184,166,0.4)'] }
          : { boxShadow: '0 0 20px rgba(40,168,255,0.2)' }
        }
        transition={{ duration: 1.5, repeat: isListening || isSpeaking ? Infinity : 0 }}
      >
        {/* Gradient background circle */}
        <div
          className={`${s.inner} rounded-full flex items-center justify-center`}
          style={{
            background: isListening
              ? 'linear-gradient(135deg, #1e40af, #0e8bf5)'
              : isSpeaking
              ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
              : isProcessing
              ? 'linear-gradient(135deg, #6d28d9, #8b5cf6)'
              : 'linear-gradient(135deg, #0f2040, #1e3a6b)'
          }}
        >
          {/* Face / emoji */}
          <motion.span
            className={s.text}
            animate={isProcessing ? { rotate: 360 } : isSpeaking ? { scale: [1, 1.1, 1] } : {}}
            transition={isProcessing
              ? { duration: 2, repeat: Infinity, ease: 'linear' }
              : { duration: 0.5, repeat: isSpeaking ? Infinity : 0 }
            }
          >
            {isProcessing ? '⚙️' : isSpeaking ? '🤖' : isListening ? '👂' : '🤖'}
          </motion.span>
        </div>

        {/* Processing spinner overlay */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.div>

      {/* Status badge */}
      <motion.div
        className="absolute -bottom-1 -right-1 rounded-full px-2 py-0.5 text-xs font-semibold"
        style={{
          background: isListening ? '#0e8bf5' : isSpeaking ? '#0d9488' : isProcessing ? '#7c3aed' : '#1e3a6b',
          color: 'white'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={state}
      >
        {isListening ? '🎙 Live' : isSpeaking ? '🔊 Speaking' : isProcessing ? '⏳ Thinking' : '💤 Ready'}
      </motion.div>
    </div>
  );
}
