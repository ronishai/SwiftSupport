# Deployment & Firebase environments

This document explains how to build and deploy the monorepo for development and production Firebase projects.

## Environment files

Place environment files in the repo root (do not commit secrets). Example files:

- `.env.development` (API) — used for local development
- `.env.production` (API) — used for production build/deploy
- `.env.web.development` — Vite envs for web dev
- `.env.web.production` — Vite envs for web prod

Example contents (replace with your values):

.env.development

FIREBASE_PROJECT=swiftsupport-dev
FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-dev-service-account.json
PORT=3333

.env.production

FIREBASE_PROJECT=swiftsupport-prod
FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-prod-service-account.json
PORT=8080

.env.web.development

VITE_API_URL=http://localhost:3333
VITE_FIREBASE_PROJECT=swiftsupport-dev

.env.web.production

VITE_API_URL=https://us-central1-swiftsupport-prod.cloudfunctions.net/api
VITE_FIREBASE_PROJECT=swiftsupport-prod


## Local build & serve

Install dependencies and build:

```bash
pnpm install
pnpm run build:api:dev
pnpm run build:web:dev
```

Run web dev server and API locally:

```bash
pnpm --filter @swift-support/web dev
pnpm --filter @swift-support/api serve
```

## Firebase CLI quick commands

Select project and deploy web (hosting) or functions (if using functions):

```bash
# choose project
firebase use development
# or
firebase use production

# deploy hosting
firebase deploy --only hosting

# deploy functions (if using Cloud Functions)
firebase deploy --only functions
```

## CI example (GitHub Actions)

A minimal pipeline to build and deploy the `api` and `web` projects. Use secrets for Firebase service account and project selection.

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
          firebase deploy --project swiftsupport-prod --token ${{ secrets.FIREBASE_TOKEN }}
```

Notes:
- Keep service account JSON and `FIREBASE_TOKEN` as repository secrets.
- For preview deployments (dev), adjust the `--project` flag.

## NX/esbuild notes

- The `api` project uses `@nx/esbuild:esbuild` executor and `apps/api/esbuild.config.cjs`.
- If your CI environment cannot load this config directly, use the included wrapper script:

```bash
node ./scripts/esbuild-wrapper.mjs
```

This explicitly loads the CommonJS config and calls `esbuild.build()`.

## Troubleshooting

- If you see errors about optional Nest packages (microservices, websockets), ensure `apps/api/esbuild.config.cjs` lists them in `external` so they are not bundled.
- If builds differ between developer machines and CI, verify Node version (recommended node 18+) and `pnpm` version.
