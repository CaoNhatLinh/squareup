const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const config = require('./index');

const serviceAccountPath = path.resolve(__dirname, '..', '..', config.SERVICE_ACCOUNT_PATH);

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: Service account key not found at:', serviceAccountPath);
  console.error('Please place your serviceAccountKey.json in the server root directory or configure SERVICE_ACCOUNT_PATH in .env');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.FIREBASE_DB_URL,
});

const db = admin.database();

module.exports = { admin, db };
