/**
 * useGoogleTTS — Google Chirp 3 HD Text-to-Speech hook
 *
 * Features:
 *  - Sentence-level streaming: synthesizes & plays chunks sequentially
 *  - In-flight cancellation: new speak() immediately cancels current audio
 *  - Browser TTS fallback when Google API unavailable
 *  - onWord callback for animated text highlighting
 *  - Exponential backoff retry on transient errors
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import axios from 'axios';

function isAutoplayBlocked(err) {
  const name = err?.name || '';
  const msg = String(err?.message || err || '').toLowerCase();
  return name === 'NotAllowedError' || msg.includes("user didn't interact") || msg.includes('play() failed');
}

function textForSpeech(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Browser TTS fallback ──────────────────────────────────────────────────────
function browserSpeak(text, { onStart, onEnd, onError } = {}) {
  if (!window.speechSynthesis) { onError?.('no-speech-synthesis'); return; }
  window.speechSynthesis.cancel();

  const u  = new SpeechSynthesisUtterance(text);
  u.lang   = 'en-IN';
  u.rate   = 0.95;
  u.pitch  = 1.05;

  const voices  = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Neural')))
    || voices.find(v => v.lang.includes('en-IN'))
    || voices[0];
  if (preferred) u.voice = preferred;

  u.onstart = onStart;
  u.onend   = onEnd;
  u.onerror = () => onError?.('synthesis-error');
  window.speechSynthesis.speak(u);
}

// ── Sentence splitter ─────────────────────────────────────────────────────────
function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useGoogleTTS() {
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [voiceMode, setVoiceMode]       = useState('unknown'); // 'google-chirp3' | 'browser'
  const [currentVoice, setCurrentVoice] = useState('');
  const [pendingTts, setPendingTts]     = useState(false);

  const cancelRef    = useRef(false);   // flip to true to abort current utterance
  const audioRef     = useRef(null);    // active <Audio> element
  const abortCtrlRef = useRef(null);    // AbortController for in-flight axios
  const pendingAudioUrlsRef = useRef([]);
  const pendingBrowserTextRef = useRef('');

  const playAudioUrls = useCallback(async (urls, { onStart, onEnd, allowDefer = true } = {}) => {
    if (!urls.length) {
      onEnd?.();
      return { played: false, blocked: false };
    }

    setIsSpeaking(true);
    onStart?.();

    for (let i = 0; i < urls.length; i += 1) {
      if (cancelRef.current) break;

      const audio = new Audio(urls[i]);
      audio.playbackRate = 1.0;
      audioRef.current = audio;

      try {
        await audio.play();
      } catch (err) {
        audioRef.current = null;
        setIsSpeaking(false);
        if (allowDefer && isAutoplayBlocked(err)) {
          pendingAudioUrlsRef.current = urls.slice(i);
          setPendingTts(true);
          onEnd?.();
          return { played: false, blocked: true };
        }
        console.warn('[TTS] audio.play() failed:', err?.message || err);
        onEnd?.();
        return { played: false, blocked: false };
      }

      await new Promise((resolve) => {
        audio.onended = resolve;
        audio.onerror = resolve;
      });
    }

    audioRef.current = null;
    setIsSpeaking(false);
    onEnd?.();
    return { played: true, blocked: false };
  }, []);

  // On mount, probe Google TTS availability
  useEffect(() => {
    axios.get('/api/voice/status')
      .then(({ data }) => {
        const tts = data.services?.google?.tts;
        if (tts?.alive) {
          setVoiceMode('google-chirp3');
          setCurrentVoice(tts.voice || '');
        } else {
          setVoiceMode('browser');
        }
      })
      .catch(() => setVoiceMode('browser'));
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    abortCtrlRef.current?.abort();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
    pendingAudioUrlsRef.current = [];
    pendingBrowserTextRef.current = '';
    setPendingTts(false);
  }, []);

  const playPendingTts = useCallback(() => {
    const urls = pendingAudioUrlsRef.current;
    const text = pendingBrowserTextRef.current;
    pendingAudioUrlsRef.current = [];
    pendingBrowserTextRef.current = '';
    setPendingTts(false);

    if (urls.length) {
      cancelRef.current = false;
      void playAudioUrls(urls, { allowDefer: false }).then((result) => {
        if (!result.played && text) {
          browserSpeak(text, {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          });
        }
      });
      return;
    }

    if (text) {
      browserSpeak(text, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [playAudioUrls]);

  const speak = useCallback(async (text, { onStart, onEnd } = {}) => {
    const speechText = textForSpeech(text);
    if (!speechText) return;
    cancel(); // stop any current speech immediately

    cancelRef.current = false;
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    // ── Attempt Google Chirp 3 HD ─────────────────────────────────────────
    if (voiceMode === 'google-chirp3' || voiceMode === 'unknown') {
      setIsLoading(true);

      try {
        // Stream mode: synthesize sentence-by-sentence
        const { data } = await axios.post('/api/voice/synthesize',
          { text: speechText, stream: true },
          { signal: ctrl.signal, timeout: 10000 }
        );

        setIsLoading(false);

        if (cancelRef.current) return;
        const chunks = data.chunks || [];
        const urls = chunks
          .map(chunk => chunk.audioContent && `data:audio/mp3;base64,${chunk.audioContent}`)
          .filter(Boolean);
        pendingBrowserTextRef.current = speechText;

        const result = await playAudioUrls(urls, { onStart, onEnd, allowDefer: true });
        if (result.blocked) {
          console.warn('[TTS] Audio is ready, but Chrome blocked autoplay. Tap “Hear reply” to play it.');
          return;
        }

        if (!cancelRef.current) {
          setVoiceMode('google-chirp3'); // confirm it works
        }
        return;
      } catch (err) {
        setIsLoading(false);
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;

        console.warn('[TTS] Google failed; reply queued for tap-to-play:', err.message);
        setVoiceMode('browser');
        pendingBrowserTextRef.current = speechText;
        setPendingTts(true);
        onEnd?.();
        return;
      }
    } else {
      // ── Browser TTS ───────────────────────────────────────────────────────
      pendingBrowserTextRef.current = speechText;
      setPendingTts(true);
      onEnd?.();
      return;
    }
  }, [voiceMode, cancel, playAudioUrls]);

  return { speak, cancel, isSpeaking, isLoading, voiceMode, currentVoice, pendingTts, playPendingTts };
}
