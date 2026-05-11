require('dotenv').config({ override: true });
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const conversationRoutes = require('./routes/conversation');
const servicesRoutes     = require('./routes/services');
const bookingsRoutes     = require('./routes/bookings');
const offersRoutes       = require('./routes/offers');
const paymentRoutes      = require('./routes/payment');
const voiceRoutes        = require('./routes/voice');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Voice route needs larger body limit for base64 audio (~10MB audio = ~13MB base64)
app.use('/api/voice/transcribe', express.json({ limit: '15mb' }));
app.use(express.json({ limit: '10kb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter  = rateLimit({ windowMs: 15 * 60_000, max: 500, message: { error: 'Too many requests.' } });
const chatLimiter = rateLimit({ windowMs: 60_000,      max: 30,  message: { error: 'Too many messages. Please slow down.' } });

app.use('/api', apiLimiter);
app.use('/api/conversation/chat', chatLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/conversation', conversationRoutes);
app.use('/api/services',     servicesRoutes);
app.use('/api/bookings',     bookingsRoutes);
app.use('/api/offers',       offersRoutes);
app.use('/api/payment',      paymentRoutes);
app.use('/api/voice',        voiceRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'Urban Klean Dino Voice Agent',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const G = process.env.GOOGLE_API_KEY;
  const A = process.env.ANTHROPIC_API_KEY;
  const R = process.env.RAZORPAY_KEY_ID;

  console.log(`\n🤖 Dino Voice Agent — Urban Klean`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log(`   🧠 Anthropic Claude : ${A  ? '✅ ' + 'claude-sonnet-4-6' : '❌ Missing ANTHROPIC_API_KEY'}`);
  console.log(`   🎙 Google Chirp 3 HD: ${G  ? '✅ ' + (process.env.GOOGLE_TTS_VOICE || 'en-IN-Chirp3-HD-Aoede') : '⚠️  Missing GOOGLE_API_KEY (browser TTS fallback)'}`);
  console.log(`   👂 Google STT Chirp2: ${G  ? '✅ ' + (process.env.GOOGLE_STT_LANGUAGE || 'en-IN') : '⚠️  Missing (Web Speech API fallback)'}`);
  console.log(`   💳 Razorpay         : ${R  ? '✅ ' + (R.startsWith('rzp_test') ? 'test mode' : 'live mode') : '⚠️  Demo mode'}`);
  console.log(`\n   📊 /api/voice/status — full service health\n`);
});
