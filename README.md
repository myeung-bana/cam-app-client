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

- **Join:** `GET/POST` Nhost Functions `/guest/join/*` (proxied via `/api/functions` in the browser)
- **Upload:** `POST /api/guest/upload` (same-origin proxy → Nhost Storage + Hasura `insert_media`)
- **Heartbeat:** `POST /guest/session/heartbeat`
- **Data:** Hasura GraphQL with **guest** JWT (`x-hasura-event-id` claim)
- **Storage:** Nhost Storage bucket `cam-bucket` (see cam-app-nhost README for ACL)

### Before live upload testing

1. Deploy **cam-app-nhost** (functions + Hasura metadata in `nhost/metadata/`).
2. Configure **Auth → Hooks → Custom access token** → `{FUNCTIONS_URL}/auth/access-token`.
3. Set **server env** on Vercel/local (not `NEXT_PUBLIC_`): `NHOST_ADMIN_SECRET`, `NHOST_SUBDOMAIN`, `NHOST_REGION`, `NHOST_STORAGE_BUCKET` — same as cam-app-admin. Upload uses admin secret server-side after guest JWT validation.
4. Ensure Storage bucket **`cam-bucket`** exists in Nhost Dashboard.
5. Re-join the event after the auth hook is live (old JWTs lack `guest` role + event claim).
