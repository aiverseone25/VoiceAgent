import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Send, RotateCcw, Radio, Volume2 } from 'lucide-react';

// ── Dino avatar ───────────────────────────────────────────────────────────────
function DinoAvatar({ size = 28, pulse = false }) {
  return (
    <motion.div
      className="rounded-full overflow-hidden flex-shrink-0 bg-brand-100"
      style={{ width: size, height: size, boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }}
      animate={pulse ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.6, repeat: pulse ? Infinity : 0 }}
    >
      <img
        src="/dino.png" alt="Dino"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        onError={e => {
          e.target.style.display = 'none';
          e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.55}px">🦖</div>`;
        }}
      />
    </motion.div>
  );
}

// ── Voice quality badge ───────────────────────────────────────────────────────
function VoiceBadge({ voiceBadge, currentVoice }) {
  const [show, setShow] = useState(false);
  if (!voiceBadge) return null;
  return (
    <div className="relative">
      <button
        onClick={() => setShow(s => !s)}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
        style={{ background: voiceBadge.color + '20', color: voiceBadge.color }}
      >
        <Radio className="w-2.5 h-2.5" />
        {voiceBadge.label}
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            className="absolute top-7 right-0 bg-white rounded-xl shadow-lg p-3 min-w-[180px] z-10 border border-gray-100"
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Voice Engine</p>
            <p className="text-xs text-gray-700 font-semibold">{voiceBadge.label}</p>
            {currentVoice && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{currentVoice}</p>}
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: voiceBadge.color }} />
              <span className="text-[10px] text-gray-500">
                {voiceBadge.label === 'Chirp 3 HD' ? 'Google Cloud Neural' : 'Browser built-in'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Wave bars ─────────────────────────────────────────────────────────────────
function WaveBars({ color = '#7c3aed', count = 7 }) {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ background: color }}
          animate={{ height: [4, 14 + Math.sin(i) * 8, 4], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8 + i * 0.08, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
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
      <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-brand-600 text-white rounded-tr-sm'
          : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
      }`} style={{ boxShadow: isUser ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' }}>
        {msg.content}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function Typing() {
  return (
    <motion.div className="flex gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <DinoAvatar size={28} pulse />
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-brand-400"
            animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Push-to-talk button ───────────────────────────────────────────────────────
function PushToTalkBtn({ isRecording, onStart, onStop, micError }) {
  const pressTimer = useRef(null);

  const handlePointerDown = () => {
    pressTimer.current = setTimeout(() => onStart(), 100);
  };
  const handlePointerUp = () => {
    clearTimeout(pressTimer.current);
    if (isRecording) onStop();
  };

  return (
    <motion.button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center select-none touch-none"
      style={{
        background: isRecording
          ? 'linear-gradient(135deg, #dc2626, #ef4444)'
          : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        boxShadow: isRecording
          ? '0 0 0 4px rgba(220,38,38,0.2), 0 4px 16px rgba(220,38,38,0.4)'
          : '0 4px 16px rgba(124,58,237,0.4)',
      }}
      animate={isRecording ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.6, repeat: isRecording ? Infinity : 0 }}
      whileTap={{ scale: 0.9 }}
      title={micError || (isRecording ? 'Release to send' : 'Hold to speak')}
    >
      {isRecording
        ? <motion.div className="w-3 h-3 rounded-sm bg-white" animate={{ scale: [1, 0.8, 1] }} transition={{ duration: 0.4, repeat: Infinity }} />
        : <Mic className="w-5 h-5 text-white" />
      }
    </motion.button>
  );
}

// ── Confidence badge ──────────────────────────────────────────────────────────
function ConfidenceBadge({ confidence, sttMode }) {
  if (!confidence || sttMode === 'browser') return null;
  const color = confidence >= 90 ? '#059669' : confidence >= 70 ? '#d97706' : '#dc2626';
  return (
    <motion.div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: color + '15', color }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {confidence}% accuracy
    </motion.div>
  );
}

// ── Main VoiceModal ───────────────────────────────────────────────────────────
export default function VoiceModal({
  open, onClose,
  messages, isProcessing, isSpeaking, isRecording,
  micError, interimTranscript,
  onSend, onMicToggle, onReset,
  sttMode, voiceBadge, lastConfidence, currentVoice,
  pendingTts, onPlayPendingTts,
}) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = useCallback(() => {
    const msg = text.trim();
    if (!msg) return;
    setText('');
    onSend(msg);
  }, [text, onSend]);

  const status = isSpeaking    ? 'Speaking…'
    : isProcessing             ? 'Thinking…'
    : isRecording              ? '🔴 Recording — release to send'
    : sttMode === 'google'     ? 'Listening via Google Chirp 2…'
    : 'Listening — say "Hey Dino" or type';

  const statusColor = isRecording ? '#dc2626' : isSpeaking ? '#059669' : '#6b7280';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div className="absolute inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl overflow-hidden"
            style={{ height: '80vh', background: '#f5f3ff' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {/* Dino avatar with live dot */}
                <div className="relative flex-shrink-0">
                  <DinoAvatar size={44} pulse={isSpeaking} />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors ${
                    isRecording ? 'bg-red-500' : isSpeaking ? 'bg-emerald-400' : isProcessing ? 'bg-amber-400' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm">Dino</p>
                    <span className="text-[10px] text-gray-400">Urban Klean AI</span>
                  </div>
                  <p className="text-[11px] flex items-center gap-1.5 mt-0.5" style={{ color: statusColor }}>
                    {(isSpeaking || isRecording) && (
                      <motion.span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                        style={{ background: statusColor }}
                        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
                    )}
                    <span className="truncate">{status}</span>
                  </p>
                </div>

                {/* Voice bars while speaking */}
                <AnimatePresence>
                  {(isSpeaking || isRecording) && (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}>
                      <WaveBars color={isRecording ? '#dc2626' : '#7c3aed'} count={7} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Voice quality badge */}
                <VoiceBadge voiceBadge={voiceBadge} currentVoice={currentVoice} />

                {/* Reset + Close */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                  <button onClick={onReset} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Messages ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">

              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div className="flex flex-col items-center justify-center py-8 gap-3"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <motion.div className="relative"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
                    <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-300 opacity-20"
                      style={{ width: 80, height: 14, filter: 'blur(6px)' }}
                      animate={{ scaleX: [1, 0.8, 1] }} transition={{ duration: 2.8, repeat: Infinity }} />
                    <div className="rounded-3xl overflow-hidden" style={{ width: 100, height: 100, boxShadow: '0 12px 40px rgba(124,58,237,0.3)' }}>
                      <img src="/dino.png" alt="Dino"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                        onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:54px;background:linear-gradient(135deg,#7c3aed,#5b21b6)">🦖</div>'; }} />
                    </div>
                  </motion.div>
                  <p className="text-gray-700 font-bold text-base">Hi! I'm Dino 👋</p>
                  <p className="text-gray-400 text-xs text-center max-w-xs">Your Urban Klean AI — powered by AI</p>

                  {/* Voice mode indicator */}
                  {voiceBadge && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: voiceBadge.color + '15', color: voiceBadge.color }}>
                      <Radio className="w-3 h-3" />
                      {voiceBadge.label} Voice Active
                    </div>
                  )}

                  {/* Quick chips */}
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {['🏠 Book home cleaning', '✨ Deep cleaning prices', '🎁 What offers do you have?', '📋 My past bookings'].map(q => (
                      <button key={q}
                        onClick={() => onSend(q.replace(/^.{2}\s/, ''))}
                        className="bg-white border border-brand-200 text-brand-700 text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ boxShadow: '0 2px 8px rgba(124,58,237,0.1)' }}>
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
                <motion.div className="flex flex-row-reverse gap-2" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
                  <div className="bg-brand-200 text-brand-800 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm italic max-w-[78%]">
                    {interimTranscript}…
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input bar ────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white px-3 py-3 border-t border-gray-100">
              {pendingTts && (
                <button
                  type="button"
                  onClick={onPlayPendingTts}
                  className="mb-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                  }}
                >
                  <Volume2 className="w-4 h-4" />
                  Hear reply
                </button>
              )}

              {/* Confidence + STT mode strip */}
              <AnimatePresence>
                {(isRecording || lastConfidence) && (
                  <motion.div className="flex items-center gap-2 px-1 pb-2"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    {isRecording && (
                      <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                        <motion.div className="w-2 h-2 rounded-full bg-red-500"
                          animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                        Recording via {sttMode === 'google' ? 'Google Chirp 2' : 'Browser'}
                      </div>
                    )}
                    {!isRecording && <ConfidenceBadge confidence={lastConfidence} sttMode={sttMode} />}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                {/* Push-to-talk */}
                <PushToTalkBtn
                  isRecording={isRecording}
                  onStart={onMicToggle}
                  onStop={onMicToggle}
                  micError={micError}
                />

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={isRecording ? 'Recording… release mic to send' : 'Type or hold mic to speak…'}
                  disabled={isRecording}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-400 disabled:opacity-50 transition-colors"
                />

                {/* Send */}
                <motion.button
                  onClick={handleSend}
                  disabled={!text.trim() || isRecording}
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30"
                  style={{ background: text.trim() && !isRecording ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#f3f4f6' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className={`w-4 h-4 ${text.trim() && !isRecording ? 'text-white' : 'text-gray-400'}`} />
                </motion.button>
              </div>

              {/* Mic error */}
              {micError && (
                <p className="text-red-400 text-[10px] mt-1.5 px-1 flex items-center gap-1">
                  <MicOff className="w-3 h-3" /> {micError}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
