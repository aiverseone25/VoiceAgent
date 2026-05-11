import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot } from 'lucide-react';

function MessageBubble({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Avatar icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm
          ${isUser ? 'bg-brand-700' : 'bg-gradient-to-br from-brand-600 to-teal-600'}`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-brand-700 text-white rounded-tr-sm'
              : 'bg-clean-card border border-clean-border text-slate-200 rounded-tl-sm'
            }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-slate-500 px-1">
          {new Date(message.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-teal-600 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-clean-card border border-clean-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400"
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ConversationDisplay({ messages, isProcessing, interimTranscript }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <MessageBubble key={`${msg.ts}-${i}`} message={msg} index={i} />
        ))}

        {isProcessing && <TypingIndicator key="typing" />}
      </AnimatePresence>

      {/* Interim transcript ghost text */}
      {interimTranscript && (
        <motion.div
          className="flex gap-3 flex-row-reverse opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
        >
          <div className="w-8 h-8 rounded-full bg-brand-700/50 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="max-w-[75%] bg-brand-800/40 border border-brand-700/30 text-slate-300 px-4 py-3 rounded-2xl rounded-tr-sm text-sm italic">
            {interimTranscript}...
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
