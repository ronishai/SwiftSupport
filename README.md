# SwiftSupport

**SwiftSupport** is an IT helpdesk ticketing system built for organizations that need a fast, QR-code-based way for employees to report issues. End users scan a QR code posted in their office, fill out a short form, and their ticket is automatically routed to the correct support team. Admins manage tickets, teams, and categories through a secure dashboard.

The platform supports **English and Hebrew** (with full RTL layout) and sends automated email notifications on ticket updates.

---

## Architecture

SwiftSupport is a **pnpm monorepo** managed with [Nx](https://nx.dev), containing:

| Package | Technology | Description |
|---|---|---|
| `apps/web` | React 19 + Vite + Tailwind CSS | Customer-facing ticket form and admin dashboard |
| `apps/api` | NestJS + Firebase Admin | REST API for ticket management and user administration |
| `libs/shared` | TypeScript | Shared types used by both `web` and `api` |
| `firebase/functions` | Firebase Cloud Functions | Background triggers (ticket creation, assignment) |

**Firebase** is used for:
- **Authentication** — Firebase Auth with custom claims (`role`, `team`)
- **Firestore** — Primary database for tickets, settings, and QR token
- **Firebase Hosting** — Web app deployment

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, TanStack Query, React Router, Zustand
- **Backend**: NestJS 11, Firebase Admin SDK, Nodemailer (SMTP)
- **Database**: Cloud Firestore
- **Auth**: Firebase Authentication
- **Build system**: Nx 22, esbuild, pnpm workspaces
- **Language**: TypeScript throughout

---

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8 (`npm install -g pnpm`)
- A **Firebase project** with Firestore and Authentication enabled
- A Firebase service account JSON for the API

---

## Environment Setup

### Web app (`apps/web`)

Copy `apps/web/.env.example` to `apps/web/.env.development` (and `.env.production`) and fill in your values:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3000/api
```

### API (`apps/api`)

Copy `apps/api/.env.example` to `apps/api/.env` and fill in your values:

```env
PORT=3000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# SMTP Email Notifications (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=SwiftSupport <noreply@yourcompany.com>
```

For multi-environment setups (development vs. production Firebase projects), place your env files at:

| File | Used for |
|---|---|
| `apps/api/.env.development` | Local development API |
| `apps/api/.env.production` | Production build/deploy |
| `apps/web/.env.development` | Vite web dev server |
| `apps/web/.env.production` | Vite production build |

> **Never commit `.env` files containing real secrets.**

---

## Local Development

Install all dependencies from the repo root:

```bash
pnpm install
```

Start the web dev server:

```bash
pnpm --filter @swift-support/web dev
```

Start the API in watch mode:

```bash
pnpm --filter @swift-support/api serve
```

The web app defaults to `http://localhost:4200` and the API to `http://localhost:3000/api`.

---

## Building for Production

Build both apps in parallel:

```bash
pnpm run build
```

Or individually:

```bash
pnpm run build:web:prod
pnpm run build:api:prod
```

Output:
- Web: `apps/web/dist/`
- API: `apps/api/dist/`

---

## Firebase Setup

### Firestore rules

Deploy the security rules defined in `firebase/firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### Firestore indexes

Deploy composite indexes:

```bash
firebase deploy --only firestore:indexes
```

### Web hosting

After building the web app:

```bash
firebase deploy --only hosting
```

### Switching Firebase environments

```bash
firebase use development
# or
firebase use production
```

### QR Token

The QR code feature requires an initial token to be written to Firestore. Run the setup script once after your Firebase project is configured:

```bash
pnpm run set:qr-token
```

---

## Admin User Setup

Admin users are created through the Admin Dashboard "Create new admin" modal. Each admin is assigned:

- **Role**: `admin` (set as a custom Firebase Auth claim)
- **Team**: one of the teams configured in Settings

New admins must complete their profile (display name and team) on first login.

---

## CI/CD — GitHub Actions

A minimal pipeline that builds and deploys on every push to `main`. Store your Firebase service account and token as repository secrets.

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm run build:api:prod
      - run: pnpm run build:web:prod

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - name: Authenticate Firebase
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        run: |
          echo "$FIREBASE_SERVICE_ACCOUNT" > ./sa.json
          firebase deploy --project your-production-project-id --token ${{ secrets.FIREBASE_TOKEN }}
```

For preview (development) deployments, adjust the `--project` flag accordingly.

---

## Internationalization (i18n)

All user-facing strings are centralized in `apps/web/src/app/lib/i18n.ts`. The app supports:

- **English** (`en`) — default
- **Hebrew** (`he`) — full RTL layout

Language preference is persisted in `localStorage`. Users can switch language via the language switcher available on every page.

---

## Nx / esbuild Notes

- The `api` project uses the `@nx/esbuild:esbuild` executor with `apps/api/esbuild.config.cjs`.
- If your CI environment cannot load the config directly, use the included wrapper script:

```bash
node ./scripts/esbuild-wrapper.mjs
```

- Optional NestJS packages (`@nestjs/microservices`, `@nestjs/websockets`) are listed as `external` in the esbuild config so they are not bundled.
- Verify Node >= 18 and consistent pnpm versions across developer machines and CI to avoid build differences.

---

## Project Structure

```
SwiftSupport/
├── apps/
│   ├── api/                   # NestJS REST API
│   │   └── src/
│   │       ├── app/           # App module
│   │       ├── auth/          # Auth guard and middleware
│   │       ├── firebase/      # Firebase Admin module
│   │       ├── notifications/ # Email notification service
│   │       ├── settings/      # Categories and teams CRUD
│   │       ├── tickets/       # Ticket CRUD and status management
│   │       └── users/         # Admin user management
│   └── web/                   # React frontend
│       └── src/app/
│           ├── components/    # Reusable UI components
│           ├── hooks/         # React hooks (auth, locale, tickets)
│           ├── lib/           # Firebase client, Axios instance, i18n
│           ├── pages/         # Route-level page components
│           └── store/         # Zustand auth store
├── firebase/
│   └── functions/             # Firebase Cloud Functions
├── libs/
│   └── shared/                # Shared TypeScript types
├── scripts/                   # Utility scripts (QR token setup)
├── firebase.json
├── nx.json
└── package.json
```

---

## License

MIT
