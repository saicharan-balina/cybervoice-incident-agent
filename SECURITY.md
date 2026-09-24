# SECURITY POLICY & RESPONSIBLE DISCLOSURE

## 1. Secret Management Policy
- **Permanent Keys:** The AssemblyAI API key is strictly maintained on the backend inside environment variables (`server/.env`).
- **Client Tokens:** The client interface interacts exclusively through short-lived, single-session temporary tokens generated via `GET /api/voice/token` (`/v1/token?expires_in_seconds=480`).
- **No Client Exposure:** The production frontend bundle and source code are strictly scanned to ensure no API keys or credentials can be leaked through source maps, local storage, logs, or network payloads.

## 2. Sensitive Credential Handling
- **No Password or OTP Storage:** CyberVoice AI is programmed to actively dissuade and prevent users from stating passwords, PINs, OTP codes, credit card security codes (CVV), or bank account numbers.
- **Incident Scoping:** Only metadata (such as whether credentials or banking data were potentially exposed, suspicious URLs, and timestamps) are retained to determine urgency and triage priority.

## 3. Explicit Confirmation Protocol
- **No Involuntary Persistence:** Incident records are never saved to the database solely on the basis of model inference or automatic triggers.
- **Mandatory User Confirmation:** A structured review modal must be explicitly confirmed by the user before any persistence occurs to ensure human agency.

## 4. Triage Boundary Notice
- CyberVoice AI is designed as a first-line incident triage companion.
- It does not replace professional incident response or forensic investigations.
- It does not guarantee whether any particular web address is malicious or clean.

## 5. Responsible Disclosure
If you discover any security vulnerabilities or privacy concerns, please open a secure issue or contact the repository maintainers.
