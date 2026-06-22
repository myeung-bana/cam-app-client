# cam-app-client

Guest Camera PWA for **Memo** — QR / join-code entry, mobile capture, filters, uploads, challenges.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Runs on **http://localhost:3001** (matches `GUEST_APP_URL` in cam-app-admin).

## Routes

| Path | Purpose |
|---|---|
| `/join` | Manual join-code entry |
| `/j/{joinCode}` | QR entry → resolve → welcome or state screen |
| `/j/{joinCode}/welcome` | Branding, consent, enter session |
| `/j/{joinCode}/camera` | Viewfinder + capture |
| `/j/{joinCode}/gallery` | Session-scoped uploads |
| `/j/{joinCode}/challenges` | Challenge deck + tagging |
| `/states/*` | Countdown, ended, disabled, cap full, not found |

## Backend

- **Join:** `GET/POST` Nhost Functions `/guest/join/*`
- **Heartbeat:** `POST /guest/session/heartbeat`
- **Data:** Hasura GraphQL with guest JWT
- **Storage:** Nhost Storage (`cam-bucket`)

Ensure `cam-app-nhost` guest permissions and auth access-token hook are deployed before live testing.
