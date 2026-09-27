# SAHAYAI — Final SIH 2026 Functional Prototype

**AI Assisted Household Service & Skilled Worker Platform**

This final code folder is aligned with the submitted SAHAYAI SIH deck and includes the working demo flow: service/problem reporting, Hindi voice input, image upload, AI analysis, skilled-worker discovery, booking, worker job acceptance, government incident management, Digital Twin visualization and export.

## 1. Requirements
- Node.js 18+ (Node 20+ recommended)
- npm
- Chrome/Edge recommended for Hindi browser speech recognition

## 2. Run
From the folder containing the root `package.json`:

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

The root command starts both the Vite frontend and Express API.

## 3. Live AI image + text analysis
Create `server/.env` from `server/.env.example` and add a valid API key/model for your chosen multimodal model:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=your_multimodal_model_id
```

Without an API key, the built-in deterministic demo AI fallback still works, so the SIH prototype remains runnable offline. With a configured multimodal model, the uploaded PNG/JPG/WebP image is sent with the citizen text for semantic analysis.

## 4. Hindi voice assistant
- Citizen report voice input uses `hi-IN`.
- Worker voice notification is spoken in Hindi.
- The report modal includes a Hindi voice-assistant helper.
- Browser support varies; Chrome/Edge is recommended.

## 5. Functional demo actions
- Role switch: Citizen / Government / Worker
- Sidebar navigation with smooth scrolling
- Report issue
- Hindi voice input
- Upload image + preview
- AI analysis
- Submit verified report
- Incident status updates
- Government incident filters
- Government workforce view
- CSV incident export
- Worker availability toggle
- Hear job notification
- Accept job
- Worker profile action
- Service booking
- Digital Twin navigation
- Notifications/profile feedback

## 6. Important demo note
The browser demo stores prototype state in localStorage and uses in-memory server endpoints. It is intentionally lightweight for SIH demonstration. Production deployment should add authentication, PostgreSQL, object storage, audited role-based access, real maps/GIS, notification infrastructure and production monitoring.

## 7. Project structure
```text
SAHAYAI-Final/
├── package.json
├── README.md
├── client/
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       └── styles.css
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/index.js
└── docs/
    └── SIH_SOURCE_ALIGNMENT.md
```
