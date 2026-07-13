import { randomBytes } from 'crypto';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const apiDir = path.join(repoRoot, 'apps/api');

function parseArgs(argv) {
  const options = { env: 'development', token: undefined };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--env' || arg === '--environment') {
      options.env = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--env=')) {
      options.env = arg.split('=')[1];
    } else if (arg.startsWith('--token=')) {
      options.token = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      options.env = arg;
    }
  }

  return options;
}

function loadEnv(envName) {
  const candidates = [
    path.join(apiDir, `.env.${envName}`),
    path.join(apiDir, '.env'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      dotenv.config({ path: candidate });
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const envName = options.env || process.env.SWIFTSUPPORT_ENV || 'development';
  loadEnv(envName);

  const token = options.token || randomBytes(24).toString('hex');
  const docPath = process.env.QR_TOKEN_DOC_PATH || 'Config/qr-token';
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!projectId || (!serviceAccountPath && (!clientEmail || !privateKey))) {
    console.error('Missing Firebase credentials. Provide FIREBASE_PROJECT_ID plus either FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.');
    process.exit(1);
  }

  const credential = serviceAccountPath
    ? cert(path.resolve(repoRoot, serviceAccountPath))
    : cert({ projectId, clientEmail, privateKey });

  const app = getApps().length ? getApps()[0] : initializeApp({ credential, projectId });
  const db = getFirestore(app);

  await db.doc(docPath).set({
    value: token,
    updatedAt: new Date().toISOString(),
    environment: envName,
  });

  console.log(`QR token written to Firestore document "${docPath}" in project "${projectId}".`);
  console.log(token);
}

main().catch((error) => {
  console.error('Failed to write QR token:', error);
  process.exit(1);
});
