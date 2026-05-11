/**
 * Voice API Routes
 * POST /api/voice/synthesize  — Google Chirp 3 HD TTS
 * POST /api/voice/transcribe  — Google Chirp 2 STT
 * GET  /api/voice/voices      — Available Chirp 3 voices list
 * GET  /api/voice/status      — Google API health check
 */

const express = require('express');
const router  = express.Router();
const { synthesize, synthesizeStream, listVoices, getCacheStats } = require('../services/googleTTS');
const { transcribe } = require('../services/googleSTT');
const rateLimit = require('express-rate-limit');

const ttsLimiter = rateLimit({ windowMs: 60_000, max: 60, message: { error: 'TTS rate limit exceeded' } });
const sttLimiter = rateLimit({ windowMs: 60_000, max: 30, message: { error: 'STT rate limit exceeded' } });

// ── POST /synthesize ──────────────────────────────────────────────────────────
router.post('/synthesize', ttsLimiter, async (req, res) => {
  const { text, voice, stream = false, speakingRate, pitch } = req.body;

  if (!text?.trim()) return res.status(400).json({ error: 'text is required' });
  if (text.length > 5000) return res.status(400).json({ error: 'text exceeds 5000 character limit' });

  if (!process.env.GOOGLE_API_KEY) {
    return res.status(503).json({ error: 'Google API not configured', fallback: true });
  }

  try {
    if (stream) {
      // Return array of sentence-level audio chunks for low-latency playback
      const chunks = await synthesizeStream(text, { voice, speakingRate, pitch });
      return res.json({ chunks, count: chunks.length });
    }

    const result = await synthesize(text, { voice, speakingRate, pitch });
    res.json({
      audioContent: result.audioContent,
      voice:        result.voice,
      cached:       result.cached,
      charCount:    text.length,
    });
  } catch (err) {
    console.error('[TTS]', err.response?.data || err.message);
    const status = err.response?.status || 500;
    res.status(status).json({
      error:    err.response?.data?.error?.message || 'TTS synthesis failed',
      fallback: true,
    });
  }
});

// ── POST /transcribe ──────────────────────────────────────────────────────────
router.post('/transcribe', sttLimiter, async (req, res) => {
  const { audio, mimeType = 'audio/webm', language } = req.body;

  if (!audio) return res.status(400).json({ error: 'audio (base64) is required' });
  // Rough size check: 10MB base64 ≈ 7.5MB audio ≈ ~5 min at 16kbps
  if (audio.length > 13_000_000) return res.status(413).json({ error: 'Audio too large (max ~5 min)' });

  if (!process.env.GOOGLE_API_KEY) {
    return res.status(503).json({ error: 'Google API not configured', fallback: true });
  }

  try {
    const result = await transcribe(audio, { mimeType, language });
    res.json(result);
  } catch (err) {
    console.error('[STT]', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error:    err.response?.data?.error?.message || 'Transcription failed',
      fallback: true,
    });
  }
});

// ── GET /voices ───────────────────────────────────────────────────────────────
router.get('/voices', (req, res) => {
  res.json({
    voices: listVoices(),
    current: process.env.GOOGLE_TTS_VOICE || 'en-IN-Chirp3-HD-Aoede',
    tier: 'Chirp 3 HD',
  });
});

// ── GET /status ───────────────────────────────────────────────────────────────
router.get('/status', async (req, res) => {
  const googleConfigured = !!process.env.GOOGLE_API_KEY;
  const anthropicConfigured = !!process.env.ANTHROPIC_API_KEY;

  let googleTTSAlive = false;
  if (googleConfigured) {
    try {
      await synthesize('test', { voice: process.env.GOOGLE_TTS_VOICE });
      googleTTSAlive = true;
    } catch { /* offline */ }
  }

  res.json({
    services: {
      anthropic: { configured: anthropicConfigured, model: 'claude-sonnet-4-6' },
      google: {
        configured:    googleConfigured,
        tts:           { alive: googleTTSAlive, model: 'Chirp 3 HD', voice: process.env.GOOGLE_TTS_VOICE },
        stt:           { model: 'Chirp 2', language: process.env.GOOGLE_STT_LANGUAGE || 'en-IN' },
        cache:         getCacheStats(),
      },
      razorpay: { configured: !!process.env.RAZORPAY_KEY_ID, mode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test') ? 'test' : 'live' },
    },
    version: '1.0.0',
  });
});

module.exports = router;
