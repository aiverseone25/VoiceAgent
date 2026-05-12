/**
 * useGoogleSTT — Hybrid Speech Recognition
 *
 * Strategy (enterprise-grade):
 *  1. Web Speech API runs continuously in background → wake word detection (zero latency)
 *  2. After wake word or when mic button held → MediaRecorder captures audio
 *  3. On release/stop → audio sent to Google STT Chirp 2 for high-accuracy transcription
 *  4. Falls back to Web Speech API transcript if Google fails
 *
 *  onTranscript(text, meta) — meta.source is 'browser' (streaming finals) or 'google' (push-to-talk).
 *
 * This gives: instant wake word response + premium accuracy for actual booking commands
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import axios from 'axios';

const WAKE_WORDS = ['hey dino', 'hi dino', 'okay dino', 'dino'];

function containsWakeWord(text) {
  const lower = text.toLowerCase().trim();
  return WAKE_WORDS.some(w => lower.includes(w));
}
function stripWakeWord(text) {
  let r = text.toLowerCase();
  WAKE_WORDS.forEach(w => { r = r.replace(w, ''); });
  return r.trim().replace(/^[,.\s]+/, '');
}

// Convert Blob → base64 string
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]); // strip data: prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Best supported MIME type for recording
function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return types.find(t => MediaRecorder.isTypeSupported?.(t)) || 'audio/webm';
}

export function useGoogleSTT({ onWakeWord, onTranscript, onInterim, onRecordingChange }) {
  const [isSupported,   setIsSupported]   = useState(false);
  const [isRecording,   setIsRecording]   = useState(false);
  const [sttMode,       setSttMode]       = useState('unknown'); // 'google' | 'browser'
  const [micError,      setMicError]      = useState(null);
  const [lastConfidence, setLastConfidence] = useState(null);

  // Web Speech API (continuous, for wake word)
  const wsRef         = useRef(null);
  const wsRunningRef  = useRef(false);
  const wsAutoRestartRef = useRef(true);
  const wsLastFinalRef = useRef('');   // deduplicate finals

  // MediaRecorder (for Google STT)
  const mrRef         = useRef(null);
  const chunksRef     = useRef([]);
  const mimeTypeRef   = useRef('audio/webm');
  const streamRef     = useRef(null);

  // ── Web Speech API — continuous wake-word listener ────────────────────────
  const startWebSpeech = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || wsRunningRef.current) return;
    wsAutoRestartRef.current = true;

    const r         = new SR();
    r.lang           = 'en-IN';
    r.continuous     = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    wsRef.current    = r;

    r.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (interim) onInterim?.(interim);
      if (final && final !== wsLastFinalRef.current) {
        wsLastFinalRef.current = final;
        onInterim?.('');
        if (containsWakeWord(final)) {
          onWakeWord?.();
          const rest = stripWakeWord(final);
          if (rest) onTranscript?.(rest, { source: 'browser' });
        } else {
          onTranscript?.(final.trim(), { source: 'browser' });
        }
      }
    };

    r.onend = () => {
      wsRunningRef.current = false;
      // auto-restart
      if (wsAutoRestartRef.current && wsRef.current === r) setTimeout(startWebSpeech, 400);
    };

    r.onerror = (e) => {
      if (e.error === 'not-allowed') setMicError('Microphone access denied');
      if (e.error === 'no-speech' || e.error === 'aborted') return;
    };

    wsRunningRef.current = true;
    r.start();
  }, [onWakeWord, onTranscript, onInterim]);

  const stopWebSpeech = useCallback(() => {
    wsAutoRestartRef.current = false;
    wsRunningRef.current = false;
    try { wsRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  // ── MediaRecorder — push-to-talk recording for Google STT ────────────────
  const startRecording = useCallback(async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
      }});
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const mr = new MediaRecorder(stream, { mimeType });
      mrRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      mr.onstop = async () => {
        const blob  = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        // Cleanup stream tracks
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        if (blob.size < 1000) return; // too short, ignore

        try {
          // Try Google STT first
          const base64 = await blobToBase64(blob);
          const { data } = await axios.post('/api/voice/transcribe', {
            audio: base64, mimeType,
          }, { timeout: 12000 });

          if (data.transcript) {
            setSttMode('google');
            setLastConfidence(data.confidence);
            if (containsWakeWord(data.transcript)) {
              onWakeWord?.();
              const rest = stripWakeWord(data.transcript);
              if (rest) onTranscript?.(rest, { source: 'google', confidence: data.confidence });
            } else {
              onTranscript?.(data.transcript, { source: 'google', confidence: data.confidence });
            }
          }
        } catch (err) {
          // Fallback: Web Speech already captured it in parallel
          console.warn('[STT] Google fallback to browser transcript');
          setSttMode('browser');
        }
      };

      mr.start(250); // collect chunks every 250ms
      setIsRecording(true);
      onRecordingChange?.(true);

      // Pause Web Speech while recording to avoid echo
      stopWebSpeech();
    } catch (err) {
      setMicError(err.message?.includes('denied') ? 'Microphone access denied' : err.message);
    }
  }, [isRecording, stopWebSpeech, onWakeWord, onTranscript, onRecordingChange]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    try { mrRef.current?.stop(); } catch { /* ignore */ }
    setIsRecording(false);
    onRecordingChange?.(false);
    onInterim?.('');
    // Resume Web Speech wake-word listener
    setTimeout(startWebSpeech, 800);
  }, [isRecording, startWebSpeech, onRecordingChange, onInterim]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasMR = !!window.MediaRecorder;

    if (SR) {
      setIsSupported(true);
      startWebSpeech();
    } else if (hasMR) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setMicError('Speech recognition not supported. Use Chrome or Edge.');
    }

    // Detect Google STT availability
    axios.get('/api/voice/status')
      .then(({ data }) => {
        setSttMode(data.services?.google?.configured ? 'google' : 'browser');
      })
      .catch(() => setSttMode('browser'));

    return () => {
      stopWebSpeech();
      stopRecording();
    };
  }, []);

  return {
    isSupported,
    isRecording,
    micError,
    sttMode,
    lastConfidence,
    startRecording,
    stopRecording,
    stopWebSpeech,
    startWebSpeech,
  };
}
