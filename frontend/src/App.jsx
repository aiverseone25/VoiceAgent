import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DinoProvider, useDino } from './context/DinoContext';
import { useGoogleTTS } from './hooks/useGoogleTTS';
import { useGoogleSTT } from './hooks/useGoogleSTT';

import HomeScreen        from './components/HomeScreen';
import DinoFloat         from './components/DinoFloat';
import VoiceModal        from './components/VoiceModal';
import BookingConfirmation from './components/BookingConfirmation';
import ServicesGrid      from './components/ServicesGrid';
import AppBottomNav      from './components/AppBottomNav';
import BookingTabScreen  from './components/BookingTabScreen';
import OffersTabScreen   from './components/OffersTabScreen';
import ProfileTabScreen  from './components/ProfileTabScreen';

const GREETING = "Hi there! I'm Dino, your Urban Klean assistant — powered by AI. How can I help you today? I can book a cleaning service, find our best offers, or check your past bookings!";

/** Hands-free Web Speech fires many short “final” segments — wait this long after the last one before sending. */
const BROWSER_COALESCE_MS = 1500;
/** After a reply finishes, wait this long to batch any dictation that arrived during the API call. */
const BROWSER_TAIL_MS = 650;

function DinoApp() {
  const { state, dispatch, sendMessage, loadServices, loadOffers, wakeUp, resetConversation } = useDino();

  // ── Voice engines ─────────────────────────────────────────────────────────
  const {
    speak, cancel: cancelSpeech,
    isSpeaking, isLoading: ttsLoading,
    voiceMode, currentVoice,
    pendingTts, playPendingTts,
  } = useGoogleTTS();

  const [modalOpen,   setModalOpen]   = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAllSvcs, setShowAllSvcs] = useState(false);
  const [greeted,     setGreeted]     = useState(false);
  const [micOn,       setMicOn]       = useState(true);
  const [mainTab,     setMainTab]     = useState('home');

  const openRef = useRef(modalOpen);
  openRef.current = modalOpen;
  const assistantSpeakingRef = useRef(false);

  const browserSpeechBufferRef = useRef('');
  const browserSpeechTimerRef = useRef(null);
  const voiceTurnInFlightRef = useRef(false);
  const executeVoiceTurnRef = useRef(async (_t) => {});

  const clearBrowserSpeechTimer = useCallback(() => {
    if (browserSpeechTimerRef.current != null) {
      clearTimeout(browserSpeechTimerRef.current);
      browserSpeechTimerRef.current = null;
    }
  }, []);

  // ── Speak helper ──────────────────────────────────────────────────────────
  const sayAndTrack = useCallback(async (text, opts = {}) => {
    assistantSpeakingRef.current = true;
    dispatch({ type: 'SET_SPEAKING', payload: true });
    await new Promise(resolve => {
      speak(text, {
        ...opts,
        onEnd: () => {
          assistantSpeakingRef.current = false;
          dispatch({ type: 'SET_SPEAKING', payload: false });
          opts.onEnd?.();
          resolve();
        },
      });
    });
  }, [speak, dispatch]);

  // ── Open Dino modal (must be above voice-turn logic — used by executeVoiceTurn) ──
  const openDino = useCallback((skipGreeting = false) => {
    setModalOpen(true);
    if (!greeted && !skipGreeting) {
      setGreeted(true);
      dispatch({ type: 'SET_AWAKE', payload: true });
      setTimeout(() => {
        sayAndTrack(GREETING).then(() => {
          dispatch({ type: 'ADD_MESSAGE', payload: { role: 'assistant', content: GREETING, ts: Date.now() } });
        });
      }, 350);
    }
  }, [greeted, sayAndTrack, dispatch]);

  const scheduleBufferedVoiceFlush = useCallback((delayMs) => {
    clearBrowserSpeechTimer();
    browserSpeechTimerRef.current = setTimeout(() => {
      browserSpeechTimerRef.current = null;

      const tryWhenIdle = () => {
        if (voiceTurnInFlightRef.current || assistantSpeakingRef.current) {
          browserSpeechTimerRef.current = setTimeout(tryWhenIdle, 200);
          return;
        }
        const merged = browserSpeechBufferRef.current.trim();
        if (!merged) return;
        browserSpeechBufferRef.current = '';
        void executeVoiceTurnRef.current(merged);
      };

      tryWhenIdle();
    }, delayMs);
  }, [clearBrowserSpeechTimer]);

  const executeVoiceTurn = useCallback(async (userText) => {
    const text = String(userText || '').trim();
    if (!text) return;
    if (voiceTurnInFlightRef.current) {
      browserSpeechBufferRef.current = (browserSpeechBufferRef.current + ' ' + text).trim();
      scheduleBufferedVoiceFlush(BROWSER_TAIL_MS);
      return;
    }
    voiceTurnInFlightRef.current = true;
    try {
      if (!openRef.current) openDino(true);
      const reply = await sendMessage(text);
      if (reply) await sayAndTrack(reply);
    } finally {
      voiceTurnInFlightRef.current = false;
      if (browserSpeechBufferRef.current.trim())
        scheduleBufferedVoiceFlush(BROWSER_TAIL_MS);
    }
  }, [openDino, sendMessage, sayAndTrack, scheduleBufferedVoiceFlush]);

  executeVoiceTurnRef.current = executeVoiceTurn;

  useEffect(() => () => clearBrowserSpeechTimer(), [clearBrowserSpeechTimer]);

  // ── Wake word detected ────────────────────────────────────────────────────
  const handleWakeWord = useCallback(() => {
    if (!openRef.current) openDino();
  }, [openDino]);

  // ── Transcript ready (from Web Speech or Google STT) ─────────────────────
  const handleTranscript = useCallback((text, meta = {}) => {
    if (!text.trim()) return;
    if (assistantSpeakingRef.current) {
      dispatch({ type: 'SET_INTERIM', payload: '' });
      return;
    }

    const source = meta.source || 'browser';

    if (source === 'google') {
      clearBrowserSpeechTimer();
      browserSpeechBufferRef.current = '';
      void executeVoiceTurn(text);
      return;
    }

    browserSpeechBufferRef.current = (browserSpeechBufferRef.current + ' ' + text).trim();
    const delay = voiceTurnInFlightRef.current ? BROWSER_TAIL_MS : BROWSER_COALESCE_MS;
    scheduleBufferedVoiceFlush(delay);
  }, [dispatch, clearBrowserSpeechTimer, executeVoiceTurn, scheduleBufferedVoiceFlush]);

  const handleInterim = useCallback((t) => {
    if (assistantSpeakingRef.current) return;
    dispatch({ type: 'SET_INTERIM', payload: t });
  }, [dispatch]);

  // ── Google STT / Web Speech hybrid ───────────────────────────────────────
  const {
    isSupported, isRecording, micError,
    sttMode, lastConfidence,
    startRecording, stopRecording,
    startWebSpeech, stopWebSpeech,
  } = useGoogleSTT({
    onWakeWord:       handleWakeWord,
    onTranscript:     handleTranscript,
    onInterim:        handleInterim,
    onRecordingChange: (rec) => dispatch({ type: 'SET_LISTENING', payload: rec }),
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => { loadServices(); loadOffers(); }, []);

  useEffect(() => {
    assistantSpeakingRef.current = isSpeaking || ttsLoading;
    dispatch({ type: 'SET_SPEAKING', payload: isSpeaking });
    if (isSpeaking || ttsLoading) {
      stopWebSpeech();
      dispatch({ type: 'SET_INTERIM', payload: '' });
      return;
    }

    const resumeId = setTimeout(() => {
      if (!assistantSpeakingRef.current) startWebSpeech();
    }, 600);
    return () => clearTimeout(resumeId);
  }, [isSpeaking, ttsLoading, startWebSpeech, stopWebSpeech, dispatch]);

  useEffect(() => {
    if (state.currentBooking && !showBooking) setShowBooking(true);
  }, [state.currentBooking]);

  // ── Modal controls ────────────────────────────────────────────────────────
  const handleClose = () => {
    setModalOpen(false);
    dispatch({ type: 'SET_INTERIM', payload: '' });
  };

  const handleReset = useCallback(async () => {
    cancelSpeech();
    await resetConversation();
    setGreeted(false);
  }, [cancelSpeech, resetConversation]);

  const handleSend = useCallback(async (msg) => {
    if (!msg.trim()) return;
    const reply = await sendMessage(msg);
    if (reply) sayAndTrack(reply);
  }, [sendMessage, sayAndTrack]);

  // ── Push-to-talk toggle ───────────────────────────────────────────────────
  const handleMicToggle = useCallback(() => {
    if (isRecording) { stopRecording(); }
    else             { startRecording(); }
  }, [isRecording, startRecording, stopRecording]);

  // ── Book service from home card ───────────────────────────────────────────
  const handleBookService = useCallback((service) => {
    openDino(true);
    setTimeout(() => handleSend(`I want to book ${service.name}`), 600);
  }, [openDino, handleSend]);

  // ── Avatar state ──────────────────────────────────────────────────────────
  const avatarState = isSpeaking || ttsLoading ? 'speaking'
    : state.isProcessing ? 'processing'
    : isRecording ? 'listening'
    : 'idle';

  // ── Voice mode badge label ────────────────────────────────────────────────
  const voiceBadge = voiceMode === 'google-chirp3'
    ? { label: 'Chirp 3 HD', color: '#059669' }
    : { label: 'Browser TTS', color: '#6b7280' };

  const openAssistant = useCallback(() => openDino(), [openDino]);

  return (
    <div className="h-full relative w-full overflow-hidden flex flex-col">

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {mainTab === 'home' && (
          <HomeScreen
            services={state.services}
            offers={state.offers}
            onBookService={handleBookService}
            onOpenDino={openAssistant}
            onSeeAllServices={() => setShowAllSvcs(true)}
            onOpenOffers={() => setMainTab('offers')}
          />
        )}

        {mainTab === 'booking' && (
          <BookingTabScreen
            currentBooking={state.currentBooking}
            bookingHistory={state.bookingHistory}
            onOpenDino={openAssistant}
          />
        )}

        {mainTab === 'offers' && (
          <OffersTabScreen
            offers={state.offers}
            onOpenDino={openAssistant}
          />
        )}

        {mainTab === 'profile' && (
          <ProfileTabScreen
            customerName={state.customerName}
            customerPhone={state.customerPhone}
            onOpenDino={openAssistant}
          />
        )}
      </div>

      <AppBottomNav active={mainTab} onChange={setMainTab} />

      <DinoFloat
        onClick={() => modalOpen ? handleClose() : openDino()}
        state={avatarState}
      />

      <VoiceModal
        open={modalOpen}
        onClose={handleClose}
        messages={state.messages}
        isProcessing={state.isProcessing || ttsLoading}
        isSpeaking={isSpeaking}
        isRecording={isRecording}
        micError={micError}
        interimTranscript={state.interimTranscript}
        onSend={handleSend}
        onMicToggle={handleMicToggle}
        onReset={handleReset}
        sttMode={sttMode}
        voiceBadge={voiceBadge}
        lastConfidence={lastConfidence}
        currentVoice={currentVoice}
        pendingTts={pendingTts}
        onPlayPendingTts={playPendingTts}
      />

      <AnimatePresence>
        {showBooking && state.currentBooking && (
          <BookingConfirmation
            booking={state.currentBooking}
            onClose={() => setShowBooking(false)}
            onPaymentDone={(u) => dispatch({ type: 'SET_BOOKING', payload: u })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllSvcs && (
          <ServicesGrid services={state.services} onClose={() => setShowAllSvcs(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return <DinoProvider><DinoApp /></DinoProvider>;
}
