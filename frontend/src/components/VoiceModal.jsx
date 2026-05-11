import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Send, ChevronDown, RotateCcw } from 'lucide-react';
import VoiceBars from './VoiceBars';

// ── Dino avatar (reusable) ────────────────────────────────────────────────────
function DinoAvatar({ size = 28, animate: doAnimate = false }) {
  return (
    <motion.div
      className="rounded-full overflow-hidden flex-shrink-0 bg-brand-100"
      style={{ width: size, height: size, boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }}
      animate={doAnimate ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.6, repeat: doAnimate ? Infinity : 0 }}
    >
      <img
        src="/dino.png"
        alt="Dino"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:' + size * 0.55 + 'px">🦖</div>'; }}
      />
    </motion.div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {!isUser && <DinoAvatar size={28} />}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-tl-sm shadow-card border border-gray-100'
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function Typing() {
  return (
    <motion.div
      className="flex gap-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <DinoAvatar size={28} />
      <div className="bg-white border border-gray-100 shadow-card rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-400"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── VoiceModal ────────────────────────────────────────────────────────────────
export default function VoiceModal({
  open,
  onClose,
  messages,
  isProcessing,
  isSpeaking,
  isListening,
  micActive,
  interimTranscript,
  onSend,
  onToggleMic,
  onReset,
}) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = () => {
    const msg = text.trim();
    if (!msg) return;
    setText('');
    onSend(msg);
  };

  // Status line
  const status = isSpeaking
    ? 'Speaking…'
    : isProcessing
    ? 'Thinking…'
    : isListening
    ? 'Listening… speak now'
    : 'Tap mic or type to reply';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
            style={{
              height: '78vh',
              background: '#f5f3ff',
              maxWidth: 430,
              margin: '0 auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
              {/* Dino avatar */}
              <div className="relative flex-shrink-0">
                <DinoAvatar size={44} animate={isSpeaking} />
                {/* Live indicator dot */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isSpeaking ? 'bg-teal-400' : isListening ? 'bg-brand-500' : 'bg-gray-300'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">Dino</p>
                <p className="text-gray-400 text-[11px] flex items-center gap-1">
                  {(isSpeaking || isListening) && (
                    <motion.span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${isSpeaking ? 'bg-teal-500' : 'bg-brand-500'}`}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                  {status}
                </p>
              </div>

              {/* Voice bars in header */}
              <AnimatePresence>
                {(isSpeaking || isListening) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-0.5 h-6 overflow-hidden"
                  >
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="voice-bar" />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset + Close */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={onReset} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" title="Reset">
                  <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" title="Close">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <motion.div
                  className="flex flex-col items-center justify-center py-10 gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Shadow under Dino */}
                    <motion.div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-300 opacity-20"
                      style={{ width: 80, height: 14, filter: 'blur(6px)' }}
                      animate={{ scaleX: [1, 0.8, 1], opacity: [0.2, 0.1, 0.2] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div
                      className="rounded-3xl overflow-hidden"
                      style={{ width: 110, height: 110, boxShadow: '0 12px 40px rgba(124,58,237,0.3)' }}
                    >
                      <img
                        src="/dino.png"
                        alt="Dino"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                        onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:60px;background:linear-gradient(135deg,#7c3aed,#5b21b6)">🦖</div>'; }}
                      />
                    </div>
                  </motion.div>
                  <p className="text-gray-700 font-bold text-lg">Hi! I'm Dino 👋</p>
                  <p className="text-gray-400 text-sm text-center max-w-xs">
                    Your Urban Klean assistant. I can help you book a cleaning, check offers, or answer questions.
                  </p>

                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {[
                      '🏠 Book home cleaning',
                      '✨ Deep cleaning prices',
                      '🎁 What offers do you have?',
                      '📋 My past bookings',
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => onSend(q.split(' ').slice(1).join(' '))}
                        className="bg-white border border-brand-200 text-brand-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm hover:bg-brand-50 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((m, i) => <Bubble key={`${m.ts}-${i}`} msg={m} />)}
                {isProcessing && <Typing key="typing" />}
              </AnimatePresence>

              {/* Interim ghost */}
              {interimTranscript && (
                <motion.div className="flex flex-row-reverse gap-2 opacity-50" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
                  <div className="bg-brand-200 text-brand-800 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm italic max-w-[78%]">
                    {interimTranscript}…
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="flex-shrink-0 bg-white px-3 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* Mic toggle */}
                <motion.button
                  onClick={onToggleMic}
                  className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    micActive
                      ? 'bg-brand-600 text-white shadow-purple'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  whileTap={{ scale: 0.9 }}
                  animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.8, repeat: isListening ? Infinity : 0 }}
                >
                  {micActive ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
                </motion.button>

                {/* Text input */}
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={micActive ? 'Or type here…' : 'Type your message…'}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-400 transition-colors"
                />

                {/* Send */}
                <motion.button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30 transition-all"
                  style={{
                    background: text.trim()
                      ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                      : '#f3f4f6'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className={`w-4 h-4 ${text.trim() ? 'text-white' : 'text-gray-400'}`} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
