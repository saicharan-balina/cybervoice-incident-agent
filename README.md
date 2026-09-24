# CyberVoice AI

> **Voice-First Cybersecurity Incident Response Companion**  
> *Built for the AssemblyAI Voice Agent Hackathon 2026*

---

## 📌 Executive Summary

**CyberVoice AI** is an intelligent, voice-first cybersecurity incident response companion designed to empower nontechnical users during moments of panic. Instead of navigating confusing incident reporting forms or falling victim to secondary scams, users report suspicious emails, SMS texts, rogue URLs, bank alerts, or compromised accounts naturally using their voice.

Powered natively by the **AssemblyAI Voice Agent API**, CyberVoice conducts real-time conversational triage:
1. **Adaptive Questioning:** Listens to user statements and asks tailored, context-aware follow-up questions (e.g., detecting if a link was clicked and immediately checking for credential or financial exposure).
2. **Cautious Guidance:** Provides immediate, calm containment advice without making dangerous assumptions or claiming forensic guarantees.
3. **Structured Incident Timeline:** Generates an itemized chronological timeline distinguishing user action, data exposure, and consequence.
4. **Explicit Confirmation Protocol:** Presents a structured incident preview with risk indicators, safety guidance, and action steps. **Reports are persisted to the database strictly upon explicit user confirmation.**

---

## 🏗️ Architecture & Technology Stack

```
                     ┌──────────────────────────────────────────────┐
                     │            User (Microphone & Speaker)       │
                     └──────────────────────┬───────────────────────┘
                                            │ PCM16 (24kHz) Audio / Transcripts
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          React + Vite Frontend (SPA)         │
                     │  - Tailwind CSS Cybersecurity Theme          │
                     │  - AudioVisualizer & Web Audio Streaming      │
                     │  - Incident Preview & Confirmation Modal     │
                     └───────┬──────────────────────────────▲───────┘
                             │                              │
         GET /api/voice/token│ (Short-Lived Token)          │ WSS /v1/ws?token=...
                             ▼                              │ (Bidirectional Voice)
  ┌─────────────────────────────────────┐         ┌─────────┴────────────────────────┐
  │   Node.js + Express.js Backend API   │         │    AssemblyAI Voice Agent API    │
  │   - Rate limiting, Helmet, CORS     │         │   (wss://agents.assemblyai.com)  │
  │   - Zod schema validation           │         │  - Real-time STT / TTS           │
  │   - Promisified SQLite DB Engine    │         │  - Conversational LLM            │
  │   - AssemblyAI Token Minter Service │         │  - Dynamic Tool Calling          │
  └──────────────────┬──────────────────┘         └──────────────────────────────────┘
                     │ SQL Queries
                     ▼
  ┌─────────────────────────────────────┐
  │      SQLite Database (dev.db)       │
  │      - incidents table              │
  │      - WAL mode & Indexing          │
  └─────────────────────────────────────┘
```

### Technology Highlights
- **Voice Agent Infrastructure:** AssemblyAI Voice Agent WebSocket API (`wss://agents.assemblyai.com/v1/ws`) with secure server-minted session tokens (`/v1/token?expires_in_seconds=480`).
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router.
- **Backend:** Node.js, Express.js, TypeScript, SQLite3 with WAL mode, Zod input validation, Helmet, CORS, Express-Rate-Limit.
- **Testing:** Vitest, Supertest.

---

## 🛡️ Security Implementation & Secret Management

- **Zero Client-Side Keys:** The permanent `ASSEMBLYAI_API_KEY` is strictly confined to the backend environment (`server/.env`). The frontend only receives short-lived temporary tokens via `GET /api/voice/token`.
- **No Confidential Credential Collection:** CyberVoice explicitly instructs users never to share passwords, PINs, OTP codes, or full credit card numbers.
- **Explicit Human Confirmation:** No AI hallucination can save a record without explicit user confirmation.
- **Rate-Limited & Sanitized:** Input fields have character bounds, SQL queries are parameterized, and production errors suppress internal stack traces.

---

## 🚀 Prerequisites & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher; tested on v20.10.0)
- **npm** (v9.0.0 or higher)
- **AssemblyAI API Key** with Voice Agent API access

### Installation Steps

1. Clone repository:
   ```bash
   git clone https://github.com/saicharan-balina/cybervoice-incident-agent.git
   cd cybervoice-incident-agent
   ```

2. Install dependencies:
   ```bash
   # From root:
   npm run install:all
   # Or individually:
   cd server && npm install
   cd ../client && npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

---

## ⚙️ Environment Configuration

1. In the `server` directory, copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
2. Populate `server/.env`:
   ```ini
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   DATABASE_URL=./dev.db
   NODE_ENV=development
   ```

*(Note: Never commit your `.env` file to version control. The `.gitignore` is pre-configured to exclude all `.env` files and `.db` databases).*

---

## 💻 Running the Application Locally

You can run both server and client simultaneously:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### Terminal 2: Frontend Client
```bash
cd client
npm run dev
```
*Frontend opens at `http://localhost:5173`.*

---

## 🧪 Testing & Verification

Run the comprehensive test suite verifying the health checks, temporary token generation, Zod schema validation, and full incident CRUD lifecycle:

```bash
cd server
npm test
```

### Production Build Verification
To ensure production bundle readiness:
```bash
# Verify backend compilation
cd server && npm run build

# Verify frontend production bundle
cd ../client && npm run build
```

---

## 🎙️ Live Demo Walkthrough (2–3 Minutes)

### Scenario A: Phishing SMS with Clicked Link (Golden Path)
1. Navigate to `http://localhost:5173`.
2. Review the CyberVoice AI landing page and click **"Start Voice Session"**.
3. Allow microphone permission when prompted by your browser.
4. Notice the audio visualizer transitions to **"Connected / Listening"**.
5. Speak clearly:
   > *"I received a message saying my bank account would be blocked. It included a link, and I clicked it."*
6. **Adaptive Agent Response:** CyberVoice will respond calmly and ask:
   > *"Did you enter your password, OTP, or any banking information on that page?"*
7. User reply:
   > *"No, I got suspicious and closed the browser right away."*
8. **Guidance & Confirmation:** CyberVoice explains safe next steps and presents the structured incident summary.
9. An **Incident Confirmation Modal** appears on screen showing:
   - Category: `suspicious_message`
   - Link Clicked: `YES`
   - Credentials Shared: `NO`
   - Urgency: `High`
   - Structured Timeline and Recommended Safety Steps.
10. Click **"Confirm & Save Report"** (or say *"Save the report"*).
11. The application persists the incident into SQLite with a unique ID (e.g. `inc_...`).
12. Click **"Incidents"** in the top navigation bar to view the report dynamically displayed in the **Incident Dashboard**.
13. Open the incident details, change the status from `NEW` to `UNDER REVIEW`, and export the JSON report.

### Scenario B: Suspicious Account Compromise Email
1. Start another voice session.
2. Say: *"Someone from another country seems to have logged into my social media account, and I received a security code email."*
3. CyberVoice guides you through immediate credential revocation, asks about two-factor authentication, prepares the report, and requests confirmation before database persistence.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, DB connectivity, and AssemblyAI status |
| `GET` | `/api/voice/token` | Generates short-lived AssemblyAI Voice Agent temporary token |
| `GET` | `/api/incidents` | Lists incidents with search, urgency, type, and status filters |
| `GET` | `/api/incidents/:id` | Retrieves full incident record, timeline, and actions |
| `POST` | `/api/incidents` | Validates with Zod and creates a confirmed incident |
| `PATCH` | `/api/incidents/:id` | Updates incident status, urgency, or notes |
| `DELETE` | `/api/incidents/:id` | Deletes an incident record |

---

## ⚖️ Known Limitations & Future Roadmap
- **Browser Audio Requirements:** Requires a browser supporting the Web Audio API and `navigator.mediaDevices.getUserMedia` (Chrome, Edge, Firefox, Safari).
- **Background Noise:** While browser echo-cancellation is enabled, quiet speaking environments provide optimal transcription accuracy.
- **Enterprise Integrations:** Future releases will support direct SIEM webhook forwarding (Splunk, Microsoft Sentinel) and automated ticket creation (Jira Service Management).
