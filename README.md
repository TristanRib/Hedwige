# Hedwige Mail App (minimal)

This is a minimal demo web app to send and receive mail using an Outlook/Office365 mailbox.

Important security note: Do NOT commit real passwords into source control. Use environment variables or a secrets manager.

Setup

1. Install dependencies:

   npm install

2. Create a `.env` file (example below). You can either use SMTP credentials for sending (Office365 SMTP) and IMAP for receiving, or integrate with Microsoft Graph for more robust access.

3. Start the app:

   npm start

4. Open http://localhost:3000

.env.example

SMTP_HOST=smtp.office365.com
# Hedwige Mail App

A minimal web application for sending and receiving email using an Outlook/Office365 mailbox. The project contains:

- A middleware (Express) exposing simple JSON APIs to send mail and list recent messages.
- A tiny static frontend (served from `/`) to send an email and view recent messages.
- Unit tests (Jest + Supertest) that mock network dependencies.

This README documents how the middleware works, the API contract, frontend usage, environment configuration, testing, and troubleshooting.

---

## Table of contents

- Project overview
- Quick start
- Environment variables
- Middleware (backend)
   - API endpoints
   - Implementation notes
- Frontend
   - Pages and interactions
- Tests
- CI / Deployment suggestions
- Troubleshooting
- Security notes
- Next steps and improvements

---

## Project overview

The Express middleware provides two main features:

1. Send email via SMTP (using `nodemailer`).
2. Fetch recent messages via IMAP (using `imap-simple` + `mailparser`).

The frontend is intentionally minimal and calls the middleware endpoints to perform these actions.

This project is intended as a starting point. Office365 tenants often require modern authentication (OAuth2) which is not enabled by default for IMAP/SMTP in some organizations — see "Next steps" for a Graph-based approach.

### Why JavaScript was chosen initially

The project started in JavaScript for these practical reasons:

- Low barrier to entry: JS requires minimal toolchain setup and is familiar to most web developers.
- Rapid prototyping: using plain JS enabled fast iteration on the middleware and frontend without adding compilation steps.
- Ecosystem: many mail libraries and quick examples are available in JS, making an initial demo straightforward.

Starting with JS made it faster to produce a working prototype and validate the overall design before committing to stricter typing.

### Migration to TypeScript

This repository has been migrated to TypeScript to improve maintainability and developer experience. The key points of the migration are:

- Added TypeScript toolchain: `tsconfig.json` and `ts-node` for local execution.
- Tests run with `ts-jest` so unit tests remain fast and keep using Jest + Supertest.
- Core modules (`server`, `mailer`, `imapClient`) have TS source files (`*.ts`). Tests were converted to `*.test.ts` and use the same mocks.

Current status and how to run

- Development (run directly with ts-node):

```powershell
npm install
npm start   # uses ts-node to run server.ts
```

- Build to JavaScript and run the compiled output (for production):

```powershell
npm run build
node dist/server.js
```

- Run tests (uses ts-jest):

```powershell
npm test
```

Notes and cleanup

- Both JS and TS files may currently exist in the repository (JS files preserved during migration). For a clean conversion you can remove the old `*.js` files after verifying the TS behavior and builds.
- Some third-party libraries may not provide full TypeScript typings; the project uses `@types/*` packages where available and narrows types in a few places with `any` for third-party responses (these can be tightened iteratively).


---

## Quick start

1. Install dependencies:

```powershell
cd 'c:/Users/trist/Downloads/Hedwige'
npm install
```

2. Copy the example env and fill credentials:

```powershell
copy .env.example .env
# edit .env and add SMTP/IMAP values
```

3. Start the server:

```powershell
npm start
```

4. Open the UI in your browser:

http://localhost:3000

Or run the unit tests:

```powershell
npm test
```

---

## Environment variables

The app reads configuration from environment variables (via `dotenv`). Use `.env` in development only. Do not commit secrets.

Variables (see `.env.example`):

- SMTP_HOST (default: smtp.office365.com)
- SMTP_PORT (default: 587)
- SMTP_USER (required for sending)
- SMTP_PASS (required for sending)
- IMAP_HOST (default: outlook.office365.com)
- IMAP_PORT (default: 993)
- IMAP_USER (defaults to SMTP_USER if not set)
- IMAP_PASS (defaults to SMTP_PASS if not set)
- PORT (server listen port, default: 3000)

---

## Middleware (backend)

Location: `server.js` (Express app)

The middleware exposes two JSON endpoints used by the frontend and tests.

### API endpoints

1) POST /api/send

- Description: send an email using SMTP.
- Request JSON body:
   - to (string) — recipient email address
   - subject (string)
   - text (string, optional)
   - html (string, optional)
- Response (200): { ok: true, info }
- Error (500): { ok: false, error }

2) GET /api/messages

- Description: fetch recent messages from the mailbox (IMAP).
- Query params (optional): none for now; server returns the most recent items (default limit 10).
- Response (200): { ok: true, messages: [ { subject, from, date, text, html } ] }
- Error (500): { ok: false, error }

### Implementation notes

- Sending: `mailer.js` wraps `nodemailer.createTransport` using SMTP credentials from env.
- Receiving: `imapClient.js` uses `imap-simple` to open `INBOX` and `mailparser` to parse messages.
- The server exports `app` for testing. When run directly it starts listening on `PORT`.

---

## Frontend

Location: `public/index.html`

A single-page UI with:
- A small form to send email (to /api/send)
- A button to refresh the inbox (calls /api/messages)

It's intentionally plain to keep the example focused on backend wiring. You can replace it with React/Vue/etc. as needed.

---

## Tests

- Unit tests are implemented with Jest and Supertest in `__tests__`.
- External dependencies (`mailer` and `imapClient`) are mocked so tests are fast and deterministic.

Run tests:

```powershell
npm test
```

Files:
- `__tests__/api.test.js` — happy-path tests for send and fetch
- `__tests__/api.errors.test.js` — tests for error handling and static page

---

## CI / Deployment suggestions

- Add a GitHub Actions workflow that runs `npm install` and `npm test` on push/pull_request.
- For deployments consider a container (Docker) and a secrets store (Azure Key Vault, GitHub Secrets, etc.).

Example CI job (high-level):
- checkout
- setup-node
- npm ci
- npm test

---

## Troubleshooting

If SMTP or IMAP authentication fails (common with Office365):

1. Verify login on https://outlook.office.com with the same credentials.
2. Check if MFA is enabled — IMAP/SMTP username/password may be blocked. Use app password or OAuth2.
3. Confirm SMTP AUTH and IMAP are enabled for the mailbox (Exchange admin settings can disable these).
4. Consider switching to Microsoft Graph API (OAuth2) if modern auth is required.

Common error examples:
- `535 5.7.139 Authentication unsuccessful` — invalid credentials or SMTP AUTH disabled.
- `LOGIN failed` (IMAP) — invalid credentials or IMAP disabled for account.

---

## Security notes

- Never commit `.env` with real credentials.
- Prefer OAuth2 + Microsoft Graph over IMAP/SMTP when using Exchange Online.
- For production use a secrets manager and limit permissions.

---

## Next steps / Improvements

- Implement Microsoft Graph (OAuth2) for send/receive. Add tests that mock Graph client.
- Add integration tests that can be run against a sandbox mailbox (use ephemeral test credentials in a secret store).
- Add pagination and search for messages.
- Add authentication and authorization for the frontend.

---

If you want, I can now:
- Add a GitHub Actions workflow for CI,
- Implement Microsoft Graph integration,
- Or add integration tests that run against a real mailbox using injected test credentials.

Tell me which next step you prefer and je m'en occupe.
