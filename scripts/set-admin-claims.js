const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdmin(uid, team = '') {
  await admin.auth().setCustomUserClaims(uid, { role: 'admin', team });
  console.log('Set admin claims for', uid, 'team=', team);
}

const [,, uid, team] = process.argv;
if (!uid) {
  console.error('Usage: node scripts/set-admin-claims.js <UID> [team]');
  process.exit(1);
}

setAdmin(uid, team).catch((e) => {
  console.error(e);
  process.exit(1);
});