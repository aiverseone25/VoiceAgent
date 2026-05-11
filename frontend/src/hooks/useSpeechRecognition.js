import { useEffect, useRef, useCallback, useState } from 'react';

const WAKE_WORD_PATTERNS = ['hey dino', 'hi dino', 'okay dino', 'dino'];

export function useSpeechRecognition({ onWakeWord, onTranscript, onInterim, onEnd, continuous = true }) {
  const recognitionRef = useRef(null);
  const isStartedRef = useRef(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  const containsWakeWord = useCallback((text) => {
    const lower = text.toLowerCase().trim();
    return WAKE_WORD_PATTERNS.some(pattern => lower.includes(pattern));
  }, []);

  const stripWakeWord = useCallback((text) => {
    let result = text.toLowerCase();
    for (const pattern of WAKE_WORD_PATTERNS) {
      result = result.replace(pattern, '').trim();
    }
    return result.replace(/^[,.\s]+/, '').trim();
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser. Use Chrome or Edge.');
      return;
    }
    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) onInterim?.(interim);

      if (final) {
        onInterim?.('');
        if (containsWakeWord(final)) {
          const afterWake = stripWakeWord(final);
          onWakeWord?.();
          if (afterWake) onTranscript?.(afterWake);
        } else {
          onTranscript?.(final.trim());
        }
      }
    };

    recognition.onend = () => {
      onEnd?.();
      // Auto-restart for continuous wake-word listening
      if (isStartedRef.current && continuous) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) { /* already started */ }
        }, 300);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isStartedRef.current = false;
      try { recognition.stop(); } catch (e) { /* ignore */ }
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current || isStartedRef.current) return;
    isStartedRef.current = true;
    try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    isStartedRef.current = false;
    try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
  }, []);

  return { start, stop, isSupported, error };
}

export function useTextToSpeech() {
  const utteranceRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text, { onStart, onEnd } = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Pick a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural'))
    ) || voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en'));

    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setIsSpeaking(true); onStart?.(); };
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, cancel, isSpeaking };
}
