import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// MongoDB setup
const MONGO_URL = process.env.MONGO_URL || '';

const conversationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  imageDataUrl: String,
  imageMimeType: String,
  timestamp: { type: Date, default: Date.now }
});

const journalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  notes: String
});

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);
const JournalEntry = mongoose.model('JournalEntry', journalSchema);
const Event = mongoose.model('Event', eventSchema);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/chat', async (req, res) => {
  try {
    const { provider, message, context = [], model, image, conversationId } = req.body;

    if (!provider || !message) {
      return res.status(400).json({ error: 'provider and message are required' });
    }

    let responseText = '';

    if (provider === 'chatgpt') {
      const finalModel = image ? (model || 'gpt-4o-mini') : (model || 'gpt-3.5-turbo');
      const userContent = image?.dataUrl
        ? [
            { type: 'text', text: message },
            { type: 'image_url', image_url: image.dataUrl }
          ]
        : message;

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: finalModel,
          temperature: 0.7,
          max_tokens: 2048,
          messages: [
            { role: 'system', content: 'You are a helpful mental wellness assistant.' },
            ...context,
            { role: 'user', content: userContent }
          ]
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || 'OpenAI error');
      responseText = data.choices?.[0]?.message?.content || '';
    } else if (provider === 'gemini') {
      const parts = [{ text: message }];
      if (image?.dataUrl && image?.mimeType) {
        const base64 = image.dataUrl.split(',')[1];
        parts.push({ inline_data: { mime_type: image.mimeType, data: base64 } });
      }
      const contents = [{ parts }];
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || 'Gemini error');
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (provider === 'groq') {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 2048,
          messages: [
            ...context,
            { role: 'user', content: message }
          ]
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || 'Groq error');
      responseText = data.choices?.[0]?.message?.content || '';
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    // Optionally log messages
    if (conversationId) {
      try {
        const convo = await Conversation.findById(conversationId).exec();
        if (convo) {
          const userMsg = new Message({ conversationId, role: 'user', content: message, imageDataUrl: image?.dataUrl, imageMimeType: image?.mimeType });
          const aiMsg = new Message({ conversationId, role: 'assistant', content: responseText });
          await userMsg.save();
          await aiMsg.save();
        }
      } catch (_) { /* ignore logging errors */ }
    }

    res.json({ message: responseText });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// Conversations
app.get('/api/conversations', async (_req, res) => {
  const list = await Conversation.find().sort({ createdAt: -1 }).lean().exec();
  res.json(list);
});

app.post('/api/conversations', async (req, res) => {
  const { title } = req.body || {};
  const conv = new Conversation({ title: title || 'New Conversation' });
  await conv.save();
  res.status(201).json(conv);
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  const msgs = await Message.find({ conversationId: req.params.id }).sort({ timestamp: 1 }).lean().exec();
  res.json(msgs);
});

// Journals
app.get('/api/journals', async (_req, res) => {
  const list = await JournalEntry.find().sort({ updatedAt: -1 }).lean().exec();
  res.json(list);
});

app.post('/api/journals', async (req, res) => {
  const now = new Date();
  const entry = new JournalEntry({ ...req.body, createdAt: now, updatedAt: now });
  await entry.save();
  res.status(201).json(entry);
});

app.put('/api/journals/:id', async (req, res) => {
  const updated = await JournalEntry.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true }
  ).lean().exec();
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/journals/:id', async (req, res) => {
  await JournalEntry.findByIdAndDelete(req.params.id).exec();
  res.status(204).end();
});

// Calendar events
app.get('/api/events', async (_req, res) => {
  const list = await Event.find().lean().exec();
  res.json(list);
});

app.post('/api/events', async (req, res) => {
  const event = new Event({ ...req.body });
  await event.save();
  res.status(201).json(event);
});

app.put('/api/events/:id', async (req, res) => {
  const updated = await Event.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true }).lean().exec();
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/events/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id).exec();
  res.status(204).end();
});

const PORT = process.env.PORT || 8787;
async function start() {
  if (!MONGO_URL) {
    console.warn('MONGO_URL not set; falling back to memory-like behavior is disabled. Please set MONGO_URL.');
  } else {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
  }
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});


