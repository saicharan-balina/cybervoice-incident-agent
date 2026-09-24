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

## 🏗️ Architecture & Single-URL Deployment

The complete application is built and deployed as a **single-tier unified service** accessible over a **single public URL**:

```
Browser (Microphone & Speaker)
   |
   | HTTPS (Audio, Transcripts, UI)
   v
Replit Public URL (or Single Port Host)
   |
   v
Node.js + Express Production Server (0.0.0.0:PORT)
   |
   +--> Static Assets & React SPA Fallback (Client build: /client/dist)
   |    - Overview Page (/)
   |    - Voice Assistant (/assistant)
   |    - Incident Dashboard (/dashboard)
   |    - Incident Details (/incidents/:id)
   |    - Help & Settings (/help)
   |
   +--> Backend REST API (/api/*)
   |    - Health Check (/api/health)
   |    - AssemblyAI Token Minter (/api/voice/token)
   |    - Incident CRUD (/api/incidents)
   |
   +--> SQLite Database (dev.db with WAL mode & indexing)
   |
   +--> AssemblyAI Voice Agent WebSocket (wss://agents.assemblyai.com/v1/ws)
```

### Technology Highlights
- **Voice Agent Infrastructure:** AssemblyAI Voice Agent WebSocket API (`wss://agents.assemblyai.com/v1/ws`) with secure server-minted session tokens (`/v1/token?expires_in_seconds=480`).
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router.
- **Backend:** Node.js, Express.js, TypeScript, SQLite3 with WAL mode, Zod input validation, Helmet, CORS, Express-Rate-Limit.
- **Testing:** Vitest, Supertest.

---

## 🛡️ Security Implementation & Secret Management

- **Zero Client-Side Keys:** The permanent `ASSEMBLYAI_API_KEY` is strictly confined to the backend environment (`server/.env` or Replit Secrets). The frontend only receives short-lived temporary tokens via `GET /api/voice/token`.
- **No Confidential Credential Collection:** CyberVoice explicitly instructs users never to share passwords, PINs, OTP codes, or full credit card numbers.
- **Explicit Human Confirmation:** No AI hallucination can save a record without explicit user confirmation.
- **Rate-Limited & Sanitized:** Input fields have character bounds, SQL queries are parameterized, and production errors suppress internal stack traces.

---

## ☁️ Replit Deployment Guide (Single Project, Single URL)

Deploying CyberVoice AI on Replit requires only a single Repl repository:

### Step 1: Import into Replit
1. Open [Replit](https://replit.com) and click **Create Repl**.
2. Select **Import from Git** and paste:
   ```
   https://github.com/saicharan-balina/cybervoice-incident-agent.git
   ```
3. Choose the **Node.js** template and click **Import from Git**.

### Step 2: Configure Replit Secrets
In your Repl, open the **Secrets** tool (the padlock icon in the left sidebar) and add:

| Secret Key | Description |
| :--- | :--- |
| `ASSEMBLYAI_API_KEY` | Your AssemblyAI API key (starts with your account key) |
| `NODE_ENV` | `production` |

*(Note: Never enter your API key in code files or commit `.env` files).*

### Step 3: Run the Application
The included [`.replit`](file:///.replit) file automatically instructs Replit how to run the project:
```bash
# Build frontend & backend
npm run build

# Start single unified server
npm start
```
Click the green **Run** button at the top of the Repl. Replit will:
1. Automatically install dependencies.
2. Build the React client into `client/dist`.
3. Compile the Express backend into `server/dist`.
4. Launch the unified server bound to `0.0.0.0:$PORT`.
5. Open the web view showing your public Replit URL (e.g., `https://cybervoice-incident-agent.<username>.repl.co`).

### Step 4: Verify Deployment
- **Home UI:** Visit `https://your-repl-url/`
- **Health Check:** Visit `https://your-repl-url/api/health` — should return:
  ```json
  {
    "status": "ok",
    "service": "CyberVoice AI API",
    "database": "healthy",
    "assemblyai": { "configured": true }
  }
  ```
- **Voice Agent:** Visit `https://your-repl-url/assistant` and start your voice session.

---

## 💻 Local Development Setup

### Installation Steps

1. Clone repository:
   ```bash
   git clone https://github.com/saicharan-balina/cybervoice-incident-agent.git
   cd cybervoice-incident-agent
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure local environment:
   ```bash
   cp server/.env.example server/.env
   ```
   Populate `server/.env`:
   ```ini
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   PORT=5000
   DATABASE_URL=./dev.db
   NODE_ENV=development
   ```

4. Run locally:
   ```bash
   # Option A: Run unified single-port production server
   npm run build
   npm start

   # Option B: Run dual dev servers with hot reloading
   npm run dev:server   # Terminal 1: Backend on http://localhost:5000
   npm run dev:client   # Terminal 2: Frontend Vite on http://localhost:5173
   ```

---

## 🧪 Testing & Verification

Run the comprehensive test suite verifying the health checks, temporary token generation, Zod schema validation, full incident CRUD lifecycle, and single-URL frontend routing:

```bash
npm test
```

---

## 🎙️ Live Demo Walkthrough (2–3 Minutes)

### Scenario A: Phishing SMS with Clicked Link (Golden Path)
1. Navigate to the application URL (`/`).
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

## ⚖️ Storage & Deployment Considerations
- **SQLite on Replit:** Standard Replit deployments maintain local files, but container restarts or serverless redeployments may cycle ephemeral files. For permanently persistent incident storage across redeployments, connect an external managed database (e.g., PostgreSQL or Turso) by setting `DATABASE_URL`.
- **Browser Audio Requirements:** Requires a browser supporting the Web Audio API and `navigator.mediaDevices.getUserMedia` (Chrome, Edge, Firefox, Safari).
- **Background Noise:** While browser echo-cancellation is enabled, quiet speaking environments provide optimal transcription accuracy.
