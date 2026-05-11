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

const GREETING = "Hi there! I'm Dino, your Urban Klean assistant — powered by Google Chirp and Claude AI. How can I help you today? I can book a cleaning service, find our best offers, or check your past bookings!";

function DinoApp() {
  const { state, dispatch, sendMessage, loadServices, loadOffers, wakeUp, resetConversation } = useDino();

  // ── Voice engines ─────────────────────────────────────────────────────────
  const {
    speak, cancel: cancelSpeech,
    isSpeaking, isLoading: ttsLoading,
    voiceMode, currentVoice,
  } = useGoogleTTS();

  const [modalOpen,   setModalOpen]   = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAllSvcs, setShowAllSvcs] = useState(false);
  const [greeted,     setGreeted]     = useState(false);
  const [micOn,       setMicOn]       = useState(true);

  const openRef = useRef(modalOpen);
  openRef.current = modalOpen;

  // ── Speak helper ──────────────────────────────────────────────────────────
  const sayAndTrack = useCallback(async (text, opts = {}) => {
    dispatch({ type: 'SET_SPEAKING', payload: true });
    await new Promise(resolve => {
      speak(text, {
        ...opts,
        onEnd: () => {
          dispatch({ type: 'SET_SPEAKING', payload: false });
          opts.onEnd?.();
          resolve();
        },
      });
    });
  }, [speak, dispatch]);

  // ── Open Dino modal ───────────────────────────────────────────────────────
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

  // ── Wake word detected ────────────────────────────────────────────────────
  const handleWakeWord = useCallback(() => {
    if (!openRef.current) openDino();
  }, [openDino]);

  // ── Transcript ready (from Web Speech or Google STT) ─────────────────────
  const handleTranscript = useCallback(async (text, confidence) => {
    if (!text.trim()) return;
    if (!openRef.current) openDino(true);

    const reply = await sendMessage(text);
    if (reply) sayAndTrack(reply);
  }, [openDino, sendMessage, sayAndTrack]);

  const handleInterim = useCallback((t) => {
    dispatch({ type: 'SET_INTERIM', payload: t });
  }, [dispatch]);

  // ── Google STT / Web Speech hybrid ───────────────────────────────────────
  const {
    isSupported, isRecording, micError,
    sttMode, lastConfidence,
    startRecording, stopRecording,
  } = useGoogleSTT({
    onWakeWord:       handleWakeWord,
    onTranscript:     handleTranscript,
    onInterim:        handleInterim,
    onRecordingChange: (rec) => dispatch({ type: 'SET_LISTENING', payload: rec }),
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => { loadServices(); loadOffers(); }, []);

  useEffect(() => {
    dispatch({ type: 'SET_SPEAKING', payload: isSpeaking });
  }, [isSpeaking]);

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

  return (
    <div className="h-full relative w-full overflow-hidden">

      <HomeScreen
        services={state.services}
        offers={state.offers}
        onBookService={handleBookService}
        onOpenDino={() => openDino()}
      />

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
