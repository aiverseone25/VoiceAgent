const express = require('express');
const router = express.Router();
const { runConversation } = require('../services/claudeAgent');
const { dbOps } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

router.post('/chat', async (req, res) => {
  try {
    const { sessionId, message, customerPhone } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const sid = sessionId || uuidv4();
    let session = dbOps.getSession(sid);
    if (!session) session = dbOps.createSession(sid, customerPhone);

    const messages = [...(session.messages || [])];
    messages.push({ role: 'user', content: message });

    const { reply, usage } = await runConversation(messages);

    messages.push({ role: 'assistant', content: reply });
    dbOps.updateSession(sid, messages);

    res.json({ sessionId: sid, reply, messageCount: messages.length, usage });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Conversation service error. Please try again.' });
  }
});

router.post('/reset', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  dbOps.updateSession(sessionId, [], 'idle');
  res.json({ success: true });
});

router.get('/history/:sessionId', (req, res) => {
  const session = dbOps.getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ sessionId: session.session_id, messages: session.messages || [], state: session.state });
});

module.exports = router;
