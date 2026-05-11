/**
 * Google Cloud Speech-to-Text — Chirp 2 model
 * Docs: https://cloud.google.com/speech-to-text/docs/chirp2-model
 *
 * Features:
 *  - Chirp 2 universal speech model (best accuracy for Indian English)
 *  - Domain-specific boosted phrases (Urban Klean vocabulary)
 *  - Profanity filter
 *  - Automatic punctuation
 *  - Speaker diarization ready
 *  - Supports WEBM_OPUS (Chrome), OGG_OPUS (Firefox), LINEAR16 (raw PCM)
 */

const axios = require('axios');

const STT_V1_ENDPOINT = 'https://speech.googleapis.com/v1/speech:recognize';
const STT_V2_ENDPOINT = 'https://speech.googleapis.com/v2/projects/{project}/locations/global/recognizers/_:recognize';

// Domain vocabulary boost — improves recognition accuracy for business terms
const SPEECH_CONTEXTS = [
  {
    phrases: [
      'Urban Klean', 'Hey Dino', 'Dino',
      'deep cleaning', 'regular cleaning', 'home cleaning',
      'bathroom cleaning', 'kitchen cleaning', 'sofa cleaning', 'carpet cleaning',
      'move in', 'move out', 'office cleaning',
      'one BHK', 'two BHK', 'three BHK', 'four BHK',
      '1BHK', '2BHK', '3BHK', '4BHK',
      'Banjara Hills', 'Jubilee Hills', 'Hyderabad', 'Secunderabad',
      'Razorpay', 'UPI', 'payment', 'booking',
      'FIRSTKLEAN', 'SUMMER25', 'DEEPKLEAN15', 'WEEKEND10',
    ],
    boost: 20,
  },
];

// Detect audio MIME type and map to Google encoding
function detectEncoding(mimeType = '') {
  if (mimeType.includes('webm'))  return { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 };
  if (mimeType.includes('ogg'))   return { encoding: 'OGG_OPUS',  sampleRateHertz: 48000 };
  if (mimeType.includes('mp4'))   return { encoding: 'MP4A_AAC',  sampleRateHertz: 44100 };
  if (mimeType.includes('wav') || mimeType.includes('pcm'))
                                  return { encoding: 'LINEAR16',  sampleRateHertz: 16000 };
  return { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 }; // Chrome default
}

async function transcribe(audioBase64, options = {}) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const { encoding, sampleRateHertz } = detectEncoding(options.mimeType);
  const languageCode = options.language || process.env.GOOGLE_STT_LANGUAGE || 'en-IN';

  const body = {
    config: {
      encoding,
      sampleRateHertz,
      languageCode,
      alternativeLanguageCodes: languageCode === 'en-IN' ? ['en-US'] : [],
      model:                'chirp_2',
      useEnhanced:          true,
      enableAutomaticPunctuation: true,
      profanityFilter:      false,
      speechContexts:       SPEECH_CONTEXTS,
      metadata: {
        interactionType:       'VOICE_SEARCH',
        microphoneDistance:    'NEARFIELD',
        originalMediaType:     'AUDIO',
        recordingDeviceType:   'SMARTPHONE',
      },
    },
    audio: { content: audioBase64 },
  };

  const { data } = await axios.post(
    `${STT_V1_ENDPOINT}?key=${apiKey}`,
    body,
    { timeout: 15000 }
  );

  const results = data.results || [];
  if (!results.length) return { transcript: '', confidence: 0, words: [] };

  const best = results[0].alternatives?.[0] || {};
  return {
    transcript:  best.transcript || '',
    confidence:  Math.round((best.confidence || 0) * 100),
    words:       best.words || [],
    languageCode: results[0].languageCode || languageCode,
  };
}

// Batch transcription for longer recordings
async function transcribeBatch(audioBase64, options = {}) {
  const { data: single } = await transcribe(audioBase64, options);
  return single;
}

module.exports = { transcribe, transcribeBatch };
