# Peer Council - Mental Wellness Platform

Peer Council is a modern mental wellness web app providing AI-assisted support, journaling, and a wellness calendar — with a beautiful, customizable UI.

## Features

- 🤖 **AI Chat**: Multi-provider AI (OpenAI, Gemini, Groq) with optional image context
- 📚 **Conversation Logs**: Multi-conversation support (backend-ready)
- 📝 **Journal**: Create, update, delete entries (backend-ready)
- 📅 **Calendar**: Create, update, delete events (backend-ready)
- 🎨 **Personalization**: Theme toggle, font family and size, surface transparency, custom/gradient backgrounds
- 🔐 **Auth**: Google OAuth (Google Identity Services)
- ⚙️ **API Settings**: Per-provider keys when using client mode; backend proxy supported

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS
- State: React Context + custom hooks
- Auth: Google Identity Services (GIS)
- AI: OpenAI, Google Gemini, Groq
- Backend: Node.js + Express (in-memory store; easily swappable to DB)

## Quick Start

### 1) Install
```bash
cd PC2314-main
npm install
```

### 2) Configure environment
Create `.env.local` in `PC2314-main`:
```
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
# Optional: Use the backend (recommended):
VITE_BACKEND_URL=http://localhost:8787
```

### 3) Run the frontend
```bash
npm run dev
```

Open http://localhost:5173

## Backend (Optional but Recommended)

The backend securely proxies AI provider calls and persists app data in-memory.

### 1) Configure backend env
Create `PC2314-main/backend/.env`:
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
PORT=8787
```

### 2) Install and run
```bash
cd PC2314-main/backend
npm install
npm run dev
```

With `VITE_BACKEND_URL` set, the frontend uses the backend automatically (no client-side API keys needed).

## Google OAuth Setup (GIS)

1. In Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web).
2. Authorized JavaScript origins: add your dev URL (e.g., http://localhost:5173) and prod domain.
3. Put the Client ID into `VITE_GOOGLE_CLIENT_ID`.
4. The GIS script is loaded in `index.html`.

## AI Providers

Two modes:
- Backend mode (recommended): Frontend → Express backend → Provider. No API keys in the browser.
- Client mode: Direct calls from the browser; set API keys in the UI.

Image support:
- OpenAI: vision-capable models via `image_url` content
- Gemini: inline_data image with text
- Groq: text-only

## App Structure (Highlights)

- `src/hooks/useAuth.jsx`: Google OAuth via GIS
- `src/hooks/useApi.jsx`: Chat API; uses backend if `VITE_BACKEND_URL` is set
- `src/contexts/AppContext.jsx`: Global state (preferences, models, etc.) and CSS variable application
- `src/components/Settings/*.jsx`: User and API settings
- `src/components/Chat/*`: Chat UI (MessageList, MessageBubble, ChatInput)
- `backend/server.js`: AI proxy + in-memory persistence for conversations, messages, journals, events

## Personalization

User settings write CSS variables:
- `--app-font-family` → applied to `body`
- `--app-font-size` → applied to `body`
- `--surface-opacity` → bound to Tailwind’s semi-transparent surfaces via `index.css`

## Troubleshooting

- Google sign-in popup flickers or fails:
  - Ensure the GIS script loads (no ad blockers), and `VITE_GOOGLE_CLIENT_ID` is correct.
  - Authorized origins in Google Cloud must match your dev URL.
- Backend returns 500:
  - Check provider keys in `backend/.env` and server logs.
- Transparency or font size not applying:
  - Confirm `AppContext` is running (it sets CSS vars) and the UI uses classes like `bg-white/90` or `dark:bg-gray-800/90`.

## Presentation Notes

- Problem: Students need accessible, empathetic mental wellness support tools.
- Solution: Peer Council blends AI guidance, journaling, and scheduling with strong personalization.
- Differentiators: Multi-provider AI, image-aware prompts, rich personalization, and optional secure backend.
- Demo flow:
  1) Sign in with Google
  2) Ask AI for guidance; optionally add an image
  3) Save a journal entry
  4) Add a calendar event
  5) Tweak font, size, transparency, and background
  6) Show settings for API keys or backend mode
