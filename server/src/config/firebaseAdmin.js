const path = require('path');
const admin = require('firebase-admin');
const config = require('./index');

// initialize firebase-admin using service account JSON
const serviceAccountPath = path.join(__dirname, '..', '..', config.SERVICE_ACCOUNT_PATH || 'src/config/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.FIREBASE_DB_URL,
});

const db = admin.database();

module.exports = { admin, db };
