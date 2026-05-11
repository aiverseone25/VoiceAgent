import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DinoProvider, useDino } from './context/DinoContext';
import { useSpeechRecognition, useTextToSpeech } from './hooks/useSpeechRecognition';

// Screens & overlays
import HomeScreen from './components/HomeScreen';
import DinoFloat from './components/DinoFloat';
import VoiceModal from './components/VoiceModal';
import BookingConfirmation from './components/BookingConfirmation';
import ServicesGrid from './components/ServicesGrid';

const GREETING = "Hi there! I'm Dino, your Urban Klean assistant. How can I help you today? I can book a cleaning service, share our latest offers, or check your past bookings!";

function DinoApp() {
  const { state, dispatch, sendMessage, loadServices, loadOffers, wakeUp, resetConversation } = useDino();
  const { speak, cancel: cancelSpeech, isSpeaking } = useTextToSpeech();

  // Modal / overlay state
  const [modalOpen, setModalOpen]   = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAllSvcs, setShowAllSvcs] = useState(false);
  const [micActive, setMicActive]   = useState(false);
  const [greeted, setGreeted]       = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openDino = useCallback((skipGreeting = false) => {
    setModalOpen(true);
    if (!greeted && !skipGreeting) {
      setGreeted(true);
      setTimeout(() => {
        dispatch({ type: 'SET_AWAKE', payload: true });
        dispatch({ type: 'SET_SPEAKING', payload: true });
        speak(GREETING, {
          onEnd: () => {
            dispatch({ type: 'SET_SPEAKING', payload: false });
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { role: 'assistant', content: GREETING, ts: Date.now() }
            });
          }
        });
      }, 350);
    }
  }, [greeted, speak, dispatch]);

  const handleWakeWord = useCallback(() => {
    if (!modalOpen) openDino();
  }, [modalOpen, openDino]);

  const handleTranscript = useCallback(async (text) => {
    if (!text.trim()) return;
    if (!modalOpen) openDino(true);

    const reply = await sendMessage(text);
    if (reply) {
      dispatch({ type: 'SET_SPEAKING', payload: true });
      speak(reply, { onEnd: () => dispatch({ type: 'SET_SPEAKING', payload: false }) });
    }
  }, [modalOpen, openDino, sendMessage, speak, dispatch]);

  const handleInterim = useCallback((t) => {
    dispatch({ type: 'SET_INTERIM', payload: t });
  }, [dispatch]);

  const { start, stop, isSupported } = useSpeechRecognition({
    onWakeWord: handleWakeWord,
    onTranscript: handleTranscript,
    onInterim: handleInterim,
    continuous: true
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => { loadServices(); loadOffers(); }, []);

  useEffect(() => {
    if (isSupported) { start(); setMicActive(true); }
  }, [isSupported]);

  useEffect(() => {
    dispatch({ type: 'SET_SPEAKING', payload: isSpeaking });
  }, [isSpeaking]);

  // Show booking card when Dino creates a booking
  useEffect(() => {
    if (state.currentBooking && !showBooking) setShowBooking(true);
  }, [state.currentBooking]);

  // ── Modal controls ────────────────────────────────────────────────────────
  const handleClose = () => {
    setModalOpen(false);
    dispatch({ type: 'SET_INTERIM', payload: '' });
  };

  const toggleMic = useCallback(() => {
    if (micActive) { stop(); setMicActive(false); }
    else { start(); setMicActive(true); }
  }, [micActive, start, stop]);

  const handleReset = useCallback(async () => {
    cancelSpeech();
    await resetConversation();
    setGreeted(false);
  }, [cancelSpeech, resetConversation]);

  const handleSend = useCallback(async (msg) => {
    if (!msg.trim()) return;
    const reply = await sendMessage(msg);
    if (reply) {
      dispatch({ type: 'SET_SPEAKING', payload: true });
      speak(reply, { onEnd: () => dispatch({ type: 'SET_SPEAKING', payload: false }) });
    }
  }, [sendMessage, speak, dispatch]);

  // ── Service booking from home card ────────────────────────────────────────
  const handleBookService = useCallback((service) => {
    openDino(true);
    const msg = `I want to book ${service.name}`;
    // small delay so modal opens first
    setTimeout(() => handleSend(msg), 600);
  }, [openDino, handleSend]);

  // ── Derive avatar state ───────────────────────────────────────────────────
  const avatarState = state.isSpeaking ? 'speaking'
    : state.isProcessing ? 'processing'
    : micActive ? 'listening'
    : 'idle';

  return (
    <div className="h-full relative w-full overflow-hidden">

      {/* ── Home Screen (always visible underneath) ── */}
      <HomeScreen
        services={state.services}
        offers={state.offers}
        onBookService={handleBookService}
        onOpenDino={() => openDino()}
      />

      {/* ── Floating Dino button ── */}
      <DinoFloat
        onClick={() => modalOpen ? handleClose() : openDino()}
        state={avatarState}
      />

      {/* ── Voice Modal (slide-up sheet) ── */}
      <VoiceModal
        open={modalOpen}
        onClose={handleClose}
        messages={state.messages}
        isProcessing={state.isProcessing}
        isSpeaking={state.isSpeaking}
        isListening={micActive && !state.isProcessing && !state.isSpeaking}
        micActive={micActive}
        interimTranscript={state.interimTranscript}
        onSend={handleSend}
        onToggleMic={toggleMic}
        onReset={handleReset}
      />

      {/* ── Booking confirmation overlay ── */}
      <AnimatePresence>
        {showBooking && state.currentBooking && (
          <BookingConfirmation
            booking={state.currentBooking}
            onClose={() => setShowBooking(false)}
            onPaymentDone={(updated) => dispatch({ type: 'SET_BOOKING', payload: updated })}
          />
        )}
      </AnimatePresence>

      {/* ── Full services grid overlay ── */}
      <AnimatePresence>
        {showAllSvcs && (
          <ServicesGrid services={state.services} onClose={() => setShowAllSvcs(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <DinoProvider>
      <DinoApp />
    </DinoProvider>
  );
}
