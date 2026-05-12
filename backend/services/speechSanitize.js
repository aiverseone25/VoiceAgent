/**
 * Strip markdown / markup for TTS (mirrors frontend/src/utils/speechSanitize.js).
 */

function sanitizeTextForSpeech(raw) {
  let s = String(raw || '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u200D\uFE0F\uFEFF]/g, '')
    .replace(/[\u204E\u2217\u066D\u2042\u2731\u2732\uFF0A\uFE61]/g, '*');

  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  s = s.replace(/`([^`]+)`/g, '$1');

  for (let i = 0; i < 4; i++) {
    s = s.replace(/\*\*\*([^*_]+)\*\*\*/g, '$1');
    s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
    s = s.replace(/\*([^*\n]+)\*/g, '$1');
    s = s.replace(/___([^_]+)___/g, '$1');
    s = s.replace(/__([^_]+)__/g, '$1');
    s = s.replace(/_([^_\n]+)_/g, '$1');
  }

  s = s
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/[*_~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

module.exports = { sanitizeTextForSpeech };
