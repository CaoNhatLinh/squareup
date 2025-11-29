const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH ;
module.exports = {
  PORT,
  FIREBASE_DB_URL,
  CORS_ORIGINS,
  SERVICE_ACCOUNT_PATH,
};
