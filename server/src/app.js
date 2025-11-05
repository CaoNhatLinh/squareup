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

// Webhook route MUST come before express.json() to get raw body
const checkoutRouter = require('./routes/checkout');
app.use('/api/checkout', checkoutRouter);

// Now parse JSON for other routes
app.use(express.json());

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const restaurantsRouter = require('./routes/restaurants');
const uploadRouter = require('./routes/upload');
const ordersRouter = require('./routes/orders');

app.use('/api/restaurants', restaurantsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/orders', ordersRouter);
app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = app;
