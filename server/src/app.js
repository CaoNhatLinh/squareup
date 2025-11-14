const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { admin, db } = require('./config/firebaseAdmin');
const config = require('./config');
const app = express();

const allowedOrigins = config.CORS_ORIGINS || [];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());

const checkoutRouter = require('./routes/checkout');
app.use('/api/checkout', checkoutRouter);

app.use(express.json({ limit: '10mb' }));

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const restaurantsRouter = require('./routes/restaurants');
const uploadRouter = require('./routes/upload');
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
const guestUsersRouter = require('./routes/guestUsers');
const reviewsRouter = require('./routes/reviews');
const transactionsRouter = require('./routes/transactions');

app.use('/api/restaurants', restaurantsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/guest-users', guestUsersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/transactions', transactionsRouter);

// Debug endpoint to check current user's token claims (dev only)
app.get('/api/debug/token', async (req, res) => {
  try {
    const sessionCookie = req.cookies && req.cookies.session;
    const authHeader = req.headers && req.headers.authorization;

    let decodedClaims = null;

    if (sessionCookie) {
      try {
        decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      } catch (err) {
        console.error("Error verifying session cookie:", err);
      }
    }

    if (!decodedClaims && authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        decodedClaims = await admin.auth().verifyIdToken(idToken, true);
      } catch (err) {
        console.error("Error verifying ID token:", err);
      }
    }

    if (!decodedClaims) {
      return res.status(401).json({ error: 'No valid token' });
    }

    res.json({
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      admin: decodedClaims.admin || false,
      customClaims: decodedClaims,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = app;
